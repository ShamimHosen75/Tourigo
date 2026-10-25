/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { packages } from '@/data/packages';
import { categories } from '@/data/categories';
import { faqs } from '@/data/content';
import { siteConfig } from '@/config/site';

// Build and memoize dynamic knowledge base
let cachedSystemPrompt: string | null = null;

function buildKnowledgeBase() {
  const pkgSummaries = packages.map((p) => {
    const batchInfo = p.batches.length
      ? `Batches: ${p.batches.map((b) => `${b.startDate} to ${b.endDate} (${b.seatsLeft} left, ৳${b.price})`).join('; ')}`
      : 'Contact for dates';
    return `- **${p.title}** (${p.region}): ${p.shortDescription} | ${p.durationDays}D/${p.durationNights}N | ৳${p.price} | Level: ${p.level} | Highlights: ${p.highlights.slice(0, 3).join(', ')} | ${batchInfo} | Link: [${p.title}](/packages/${p.slug})`;
  });

  const catSummaries = categories.map(
    (c) => `- **${c.title}**: ${c.description} (Link: [${c.title}](/packages?category=${c.slug}))`
  );

  const faqSummaries = faqs.slice(0, 8).map((f) => `Q: ${f.question}\nA: ${f.answer}`);

  return { pkgSummaries, catSummaries, faqSummaries };
}

function getSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const kb = buildKnowledgeBase();

  cachedSystemPrompt = `You are **Tourigo AI** — the fast, friendly, expert travel assistant for ${siteConfig.name}, Bangladesh's premier trekking and tour company.

## Your Personality & Response Rules (CRITICAL FOR SPEED)
1. **Be extremely fast and concise**: Keep answers to 1-3 short paragraphs or bullet points. Avoid unnecessary fluff.
2. **Always helpful**: Answer directly with tour recommendations, prices, duration, and markdown links like [Package Name](/packages/slug).
3. **Use emojis sparingly** (🏔️ 🌊 🌿 ✨ ৳).
4. **Accuracy**: Use only real prices and packages from the catalog below. Never invent prices.
5. **Language**: Automatically reply in the user's language (Bengali or English).

## Contact & Booking
- Phone: ${siteConfig.contact.phone} | WhatsApp: wa.me/${siteConfig.contact.whatsapp} | Email: ${siteConfig.contact.email}
- Booking: Submit form on package page → team calls within 24h → pay via bKash/Nagad/Bank to confirm.

## Tour Categories
${kb.catSummaries.join('\n')}

## Available Packages & Rates
${kb.pkgSummaries.join('\n')}

## Top FAQs
${kb.faqSummaries.join('\n\n')}`;

  return cachedSystemPrompt;
}

// Fastest available models in priority order
const PREFERRED_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = getSystemPrompt();

    // Convert chat history (last 10 messages for speed & context)
    const recentMessages = messages.slice(-10);
    const history = recentMessages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = recentMessages[recentMessages.length - 1];

    // Try preferred models in order of speed
    let resultStream: any = null;
    let lastError: any = null;

    for (const modelName of PREFERRED_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 750,
            topP: 0.9,
          },
        });

        const chat = model.startChat({ history });
        resultStream = await chat.sendMessageStream(lastMessage.content);
        break; // Successfully started stream
      } catch (err: any) {
        console.warn(`[chat API] Failed with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!resultStream) {
      throw lastError || new Error('Could not connect to Gemini AI model.');
    }

    // Stream chunks back to client using Web ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamErr) {
          console.error('[chat API] Stream error:', streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('[chat API] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

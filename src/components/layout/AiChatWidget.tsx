'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronDown,
  CornerDownLeft,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Square,
  X,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { translations } from '@/lib/i18n/translations';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Quick suggestion pills                                            */
/* ------------------------------------------------------------------ */

const quickSuggestions = [
  '🏔️ Best trekking packages',
  '🌊 Beach destinations',
  '👨‍👩‍👧 Family trip ideas',
  '💰 Budget-friendly tours',
  '📅 Available dates',
  '🌿 Weekend trips from Dhaka',
  '🎒 What to pack for Bandarban',
];

/* ------------------------------------------------------------------ */
/*  Markdown → JSX renderer                                            */
/* ------------------------------------------------------------------ */

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Heading 3 or 4: ### Title
    if (/^#{1,4}\s/.test(line)) {
      elements.push(
        <h4 key={i} className="mt-2.5 mb-1 text-[14px] font-bold text-slate-900">
          {inlineMarkdown(line.replace(/^#{1,4}\s/, ''))}
        </h4>
      );
      return;
    }
    // Bullet lists
    if (/^[-*•]\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-[13px] leading-relaxed text-slate-700">
          {inlineMarkdown(line.replace(/^[-*•]\s/, ''))}
        </li>
      );
      return;
    }
    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 list-decimal text-[13px] leading-relaxed text-slate-700">
          {inlineMarkdown(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
      return;
    }
    // Bold-only title line
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      elements.push(
        <p key={i} className="mt-2 text-[13px] font-bold text-slate-900">
          {line.trim().replace(/\*\*/g, '')}
        </p>
      );
      return;
    }
    // Normal paragraph
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-[13px] leading-relaxed text-slate-700">
          {inlineMarkdown(line)}
        </p>
      );
    } else {
      elements.push(<span key={i} className="block h-1.5" />);
    }
  });

  return <>{elements}</>;
}

/** Parse inline markdown: **bold**, *italic*, [text](url), `code` */
function inlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    if (match[1] && match[2]) {
      // Link
      parts.push(
        <a
          key={`l${match.index}`}
          href={match[2]}
          className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 transition-colors hover:text-brand-700 hover:decoration-brand-500"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // Bold
      parts.push(
        <strong key={`b${match.index}`} className="font-semibold text-slate-900">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Italic
      parts.push(<em key={`i${match.index}`}>{match[4]}</em>);
    } else if (match[5]) {
      // Inline code
      parts.push(
        <code
          key={`c${match.index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-brand-700"
        >
          {match[5]}
        </code>
      );
    }
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function AiChatWidget() {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const activeSuggestions = (translations[locale]?.aiChat?.suggestions as string[]) || quickSuggestions;

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Auto-scroll to bottom if user hasn't explicitly scrolled up
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollRef.current) return;
    if (force || !userScrolledUpRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Track if user scrolled up
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 90;
    userScrolledUpRef.current = isUp;
    setShowScrollBtn(isUp);
  };

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [open]);

  // Stop current generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  // Clear chat history
  const handleClearChat = () => {
    handleStop();
    setMessages([]);
    setHasError(null);
  };

  // Send message with real-time token streaming
  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setHasError(null);
    userScrolledUpRef.current = false;

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Create assistant placeholder message
    const assistantMsgId = uid();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Readable stream not supported by browser.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulated, isStreaming: true } : m
          )
        );
        scrollToBottom();
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // User voluntarily cancelled
        return;
      }
      const errMsg = err instanceof Error ? err.message : 'Failed to reach AI assistant';
      setHasError(errMsg);
      // Remove empty assistant placeholder if failed completely
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId || m.content.length > 0));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Auto-resize input
  const handleInputChange = (value: string) => {
    setInput(value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 110)}px`;
    }
  };

  return (
    <>
      {/* ── Floating trigger button ─────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setOpen(true)}
            aria-label="Open AI travel assistant"
            className="group fixed bottom-22 sm:bottom-24 right-4 sm:right-5 z-40 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-500 to-cyan-500 text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-brand-500/40"
          >
            {/* Pulse rings */}
            <span className="absolute inset-0 animate-ping2 rounded-full bg-brand-400/30" />
            <Sparkles className="relative h-6 w-6 drop-shadow-sm" />

            {/* Floating label badge (desktop) */}
            <span className="pointer-events-none absolute right-15 sm:right-16 hidden sm:flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('aiChat.launcher', 'Ask Tourigo AI')}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel (Mobile full screen, Desktop floating modal) ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop (touch to close on tablet/desktop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 flex h-[100dvh] sm:h-[min(84vh,680px)] w-full sm:w-[420px] md:w-[440px] flex-col overflow-hidden bg-white sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-[0_25px_60px_-15px_rgba(0,174,240,0.3),0_15px_35px_-10px_rgba(15,23,42,0.15)]"
            >
              {/* ─── Header ──────────────────────────────────────── */}
              <div className="relative flex items-center gap-3 border-b border-brand-600/20 bg-gradient-to-r from-brand-500 via-brand-500 to-cyan-500 px-4 py-3 sm:px-5 sm:py-3.5 text-white shadow-sm shrink-0">
                {/* Back button on mobile */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Back"
                  className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 active:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Avatar */}
                <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-500 bg-emerald-400" />
                </div>

                {/* Title & Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-[15px] font-bold text-white truncate">
                      {siteConfig.name} AI
                    </h3>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-medium tracking-wide uppercase">
                      Fast
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 truncate">
                    {t('aiChat.online', 'Online • Powered by Gemini AI')}
                  </p>
                </div>

                {/* Action buttons: Clear Chat & Close */}
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      title="Clear chat"
                      aria-label="Clear chat history"
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* ─── Messages Area ───────────────────────────────── */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-4 space-y-3.5 scroll-smooth overscroll-contain"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
              >
                {/* Empty State */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center px-2 pt-2 sm:pt-4 pb-2"
                  >
                    <div className="mb-3.5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-cyan-50 shadow-inner">
                      <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-brand-500" />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-800 text-center">
                      {t('aiChat.title', 'Tourigo Travel Assistant')} ✈️
                    </h4>
                    <p className="mt-1 text-center text-[12px] sm:text-[13px] text-slate-500 max-w-xs leading-relaxed">
                      {t(
                        'aiChat.welcome',
                        'Ask me anything about treks, beach trips, pricing, dates, or travel tips in Bangladesh.'
                      )}
                    </p>

                    <div className="mt-4 sm:mt-5 w-full">
                      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {t('aiChat.suggestedTitle', 'Suggested ideas')}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        {activeSuggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-2xs transition-all duration-150 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Message bubbles */}
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-cyan-100 text-brand-700 shadow-2xs">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`relative max-w-[85%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                        msg.role === 'user'
                          ? 'rounded-br-xs bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brand-500/15'
                          : 'rounded-bl-xs border border-slate-100 bg-slate-50/90 text-slate-800'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="space-y-1 text-slate-800">
                          {renderMarkdown(msg.content)}
                          {msg.isStreaming && (
                            <span className="inline-block h-4 w-1.5 ml-1 animate-pulse rounded-xs bg-brand-500 align-middle" />
                          )}
                        </div>
                      ) : (
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}

                      <p
                        className={`mt-1 text-[10px] ${
                          msg.role === 'user' ? 'text-white/60 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Error Banner */}
                {hasError && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700 shadow-2xs"
                  >
                    <p className="font-semibold">⚠️ {hasError}</p>
                    <p className="mt-0.5 text-red-500 text-[11px]">
                      Please check your connection or contact our team directly on WhatsApp.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Scroll-to-bottom Floating Button */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 p-1.5 shadow-md backdrop-blur-md transition-colors hover:bg-brand-50 active:scale-95"
                  >
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* ─── Input & Controls Area ───────────────────────── */}
              <div className="border-t border-slate-100 bg-white px-3 py-2.5 sm:px-4 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('aiChat.placeholder', 'Ask about tours, price, Sajek, Sundarbans...')}
                      rows={1}
                      disabled={isLoading}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 sm:py-3 pr-9 text-base sm:text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-3 focus:ring-brand-100 disabled:opacity-50"
                      style={{ maxHeight: '110px' }}
                    />
                    <kbd className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 px-1 py-0.5 text-[9px] text-slate-400 md:flex">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                    </kbd>
                  </div>

                  {/* Send or Stop button */}
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      title="Stop generating"
                      className="flex h-11 w-11 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-sm transition-all hover:bg-slate-900 active:scale-95"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      title="Send message"
                      className="flex h-11 w-11 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/35 active:translate-y-0 active:scale-95 disabled:opacity-35 disabled:shadow-none disabled:translate-y-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </form>

                <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
                  <span>⚡ Ultra-fast AI Assistant</span>
                  <span>Direct booking links included</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

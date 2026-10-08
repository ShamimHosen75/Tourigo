'use client';

import { useState } from 'react';
import { imageFor, sceneDataUri } from '@/lib/scene';
import type { SceneKind } from '@/lib/types';

/**
 * <img> that shows the real photo when one is set and falls back to the
 * generated scene artwork if it's missing or fails to load.
 */
export function SmartImage({ src, scene, seed, alt, className = '', ...rest }: { src?: string | null; scene: SceneKind; seed: string; alt: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>) {
  const [failed, setFailed] = useState(false);
  const url = failed ? sceneDataUri(scene, seed) : imageFor(src, scene, seed);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} onError={() => setFailed(true)} draggable={false} {...rest} />
  );
}

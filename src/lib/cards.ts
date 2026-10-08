import type { CardPackage } from '@/components/packages/PackageFlipCard';
import type { Package } from './types';

/** Trim a package down to what the card needs before it crosses to the client. */
export function toCard(p: Package): CardPackage {
  return {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    level: p.level,
    durationDays: p.durationDays,
    durationNights: p.durationNights,
    price: p.price,
    ageGroup: p.ageGroup,
    gender: p.gender,
    altitude: p.altitude,
    shortDescription: p.shortDescription,
    scene: p.scene,
    image: p.images[0],
  };
}

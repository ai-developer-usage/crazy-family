import type { Gender } from '../types';

/** Vibrant per-gender accent palette used across cards and the tree. */
export interface GenderTheme {
  ring: string; // border/ring colour classes
  badge: string; // small chip background
  gradient: string; // avatar fallback / header gradient
  text: string;
  emoji: string;
}

const THEMES: Record<Gender, GenderTheme> = {
  male: {
    ring: 'ring-sky-300',
    badge: 'bg-sky-100 text-sky-700',
    gradient: 'from-sky-400 to-indigo-500',
    text: 'text-sky-700',
    emoji: '👦',
  },
  female: {
    ring: 'ring-pink-300',
    badge: 'bg-pink-100 text-pink-700',
    gradient: 'from-pink-400 to-fuchsia-500',
    text: 'text-pink-700',
    emoji: '👧',
  },
  other: {
    ring: 'ring-violet-300',
    badge: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-400 to-purple-500',
    text: 'text-violet-700',
    emoji: '🧑',
  },
};

export const genderTheme = (gender: Gender): GenderTheme => THEMES[gender];

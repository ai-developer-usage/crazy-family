import type { Person } from '../types';

/**
 * Built-in demo family used when no Supabase backend is configured.
 * Three generations with spouses so the tree, siblings and children all
 * have something to show. Photos come from a free avatar service.
 */
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc,d1d4f9,c0aede,ffdfbf,b6e3f4`;

export const sampleFamily: Person[] = [
  // ── Generation 1 ─────────────────────────────────────────────
  {
    id: 'g1-grandpa',
    firstName: 'Reginald',
    lastName: 'Bloom',
    gender: 'male',
    photoUrl: avatar('Reginald'),
    birthDate: '1940-04-12',
    deathDate: '2018-11-03',
    birthPlace: 'Brighton, England',
    bio: 'The legendary patriarch. Grew prize-winning roses and told even better tall tales.',
    fatherId: null,
    motherId: null,
    spouseIds: ['g1-grandma'],
  },
  {
    id: 'g1-grandma',
    firstName: 'Beatrice',
    lastName: 'Bloom',
    gender: 'female',
    photoUrl: avatar('Beatrice'),
    birthDate: '1943-09-21',
    deathDate: null,
    birthPlace: 'Cork, Ireland',
    bio: 'Matriarch, master baker, and undefeated family Scrabble champion.',
    fatherId: null,
    motherId: null,
    spouseIds: ['g1-grandpa'],
  },

  // ── Generation 2 ─────────────────────────────────────────────
  {
    id: 'g2-dad',
    firstName: 'Marcus',
    lastName: 'Bloom',
    gender: 'male',
    photoUrl: avatar('Marcus'),
    birthDate: '1968-02-28',
    deathDate: null,
    birthPlace: 'Brighton, England',
    bio: 'Eldest son. Jazz pianist by night, terrible-pun enthusiast by day.',
    fatherId: 'g1-grandpa',
    motherId: 'g1-grandma',
    spouseIds: ['g2-mom'],
  },
  {
    id: 'g2-mom',
    firstName: 'Priya',
    lastName: 'Bloom',
    gender: 'female',
    photoUrl: avatar('Priya'),
    birthDate: '1971-07-15',
    deathDate: null,
    birthPlace: 'Mumbai, India',
    bio: 'Architect who designed half the family treehouse blueprints (the safe half).',
    fatherId: null,
    motherId: null,
    spouseIds: ['g2-dad'],
  },
  {
    id: 'g2-aunt',
    firstName: 'Sophia',
    lastName: 'Bloom',
    gender: 'female',
    photoUrl: avatar('Sophia'),
    birthDate: '1972-12-05',
    deathDate: null,
    birthPlace: 'Brighton, England',
    bio: 'The adventurous aunt. Has climbed three of the seven summits and counting.',
    fatherId: 'g1-grandpa',
    motherId: 'g1-grandma',
    spouseIds: [],
  },

  // ── Generation 3 ─────────────────────────────────────────────
  {
    id: 'g3-kid1',
    firstName: 'Leo',
    lastName: 'Bloom',
    gender: 'male',
    photoUrl: avatar('Leo'),
    birthDate: '1998-05-30',
    deathDate: null,
    birthPlace: 'London, England',
    bio: 'Video game designer and the family’s self-appointed meme historian.',
    fatherId: 'g2-dad',
    motherId: 'g2-mom',
    spouseIds: [],
  },
  {
    id: 'g3-kid2',
    firstName: 'Maya',
    lastName: 'Bloom',
    gender: 'female',
    photoUrl: avatar('Maya'),
    birthDate: '2001-10-17',
    deathDate: null,
    birthPlace: 'London, England',
    bio: 'Marine biologist in training. Can name every shark, will tell you unprompted.',
    fatherId: 'g2-dad',
    motherId: 'g2-mom',
    spouseIds: [],
  },
];

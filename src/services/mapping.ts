import type { Person } from '../types';

/** Database row shape (snake_case) as stored in the Supabase `people` table. */
export interface PersonRow {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  photo_url: string | null;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string | null;
  bio: string | null;
  father_id: string | null;
  mother_id: string | null;
  spouse_ids: string[] | null;
}

export function rowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: (row.gender as Person['gender']) ?? 'other',
    photoUrl: row.photo_url,
    birthDate: row.birth_date,
    deathDate: row.death_date,
    birthPlace: row.birth_place,
    bio: row.bio,
    fatherId: row.father_id,
    motherId: row.mother_id,
    spouseIds: row.spouse_ids ?? [],
  };
}

export function personToRow(person: Person): PersonRow {
  return {
    id: person.id,
    first_name: person.firstName,
    last_name: person.lastName,
    gender: person.gender,
    photo_url: person.photoUrl ?? null,
    birth_date: emptyToNull(person.birthDate),
    death_date: emptyToNull(person.deathDate),
    birth_place: emptyToNull(person.birthPlace),
    bio: emptyToNull(person.bio),
    father_id: person.fatherId ?? null,
    mother_id: person.motherId ?? null,
    spouse_ids: person.spouseIds,
  };
}

function emptyToNull(v?: string | null): string | null {
  const t = v?.trim();
  return t ? t : null;
}

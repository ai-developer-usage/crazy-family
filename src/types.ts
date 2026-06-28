export type Gender = 'male' | 'female' | 'other';

/**
 * A person is stored with ONLY canonical relationships:
 *   - fatherId, motherId  (who their parents are)
 *   - spouseIds           (who they are married to)
 *
 * Every other relationship — siblings, children, grandparents, in-laws — is
 * COMPUTED from these on the fly (see src/utils/relations.ts). This is what
 * keeps the data permanently consistent: there is exactly one source of truth
 * for each link, so two records can never disagree about how people relate.
 */
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  photoUrl?: string | null;
  birthDate?: string | null; // ISO 'YYYY-MM-DD'
  deathDate?: string | null; // ISO 'YYYY-MM-DD' — null/empty means living
  birthPlace?: string | null;
  bio?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouseIds: string[];
}

/** Shape used by the add/edit form before an id exists. */
export type PersonDraft = Omit<Person, 'id'> & { id?: string };

/**
 * Derived view of a single person's relatives, grouped by relation. Each group
 * is labelled per-person by gender in the UI (Father/Mother, Husband/Wife,
 * Brother/Sister, Son/Daughter), so 'other' genders degrade gracefully.
 */
export interface Relatives {
  parents: Person[];
  spouses: Person[];
  siblings: Person[];
  children: Person[];
}

/** The kind of relation a related person has to the subject. */
export type RelationKind = 'parent' | 'spouse' | 'sibling' | 'child';

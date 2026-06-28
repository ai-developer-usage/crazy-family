import type { Person, Relatives, RelationKind } from '../types';

/** Index people by id for O(1) lookups. */
export function indexById(people: Person[]): Map<string, Person> {
  return new Map(people.map((p) => [p.id, p]));
}

export function fullName(p?: Person | null): string {
  return p ? `${p.firstName} ${p.lastName}`.trim() : 'Unknown';
}

/** Direct children: anyone who lists this person as father or mother. */
export function getChildren(person: Person, people: Person[]): Person[] {
  return people.filter(
    (p) => p.fatherId === person.id || p.motherId === person.id,
  );
}

/** Siblings: anyone sharing at least one parent (and not the person). */
export function getSiblings(person: Person, people: Person[]): Person[] {
  if (!person.fatherId && !person.motherId) return [];
  return people.filter(
    (p) =>
      p.id !== person.id &&
      ((person.fatherId != null && p.fatherId === person.fatherId) ||
        (person.motherId != null && p.motherId === person.motherId)),
  );
}

/**
 * Everything about a person's relatives, derived purely from the canonical
 * parent/spouse links. There is no stored sibling or child list to fall out of
 * sync — change a parent and every derived relation updates automatically.
 */
export function getRelatives(person: Person, people: Person[]): Relatives {
  const byId = indexById(people);
  const parents = [person.fatherId, person.motherId]
    .map((id) => (id ? byId.get(id) : undefined))
    .filter((p): p is Person => Boolean(p));

  const spouses = person.spouseIds
    .map((id) => byId.get(id))
    .filter((p): p is Person => Boolean(p));

  return {
    parents,
    spouses,
    siblings: getSiblings(person, people).sort(byBirthDate),
    children: getChildren(person, people).sort(byBirthDate),
  };
}

/** Human label for a related person given the relation kind + their gender. */
export function relationLabel(kind: RelationKind, person: Person): string {
  const m = person.gender === 'male';
  const f = person.gender === 'female';
  switch (kind) {
    case 'parent':
      return m ? 'Father' : f ? 'Mother' : 'Parent';
    case 'spouse':
      return m ? 'Husband' : f ? 'Wife' : 'Spouse';
    case 'sibling':
      return m ? 'Brother' : f ? 'Sister' : 'Sibling';
    case 'child':
      return m ? 'Son' : f ? 'Daughter' : 'Child';
  }
}

/** Sort helper: oldest first; people without a birth date go last. */
export function byBirthDate(a: Person, b: Person): number {
  if (!a.birthDate) return 1;
  if (!b.birthDate) return -1;
  return a.birthDate.localeCompare(b.birthDate);
}

// ── relatives-tree adapter ────────────────────────────────────────────────
// relatives-tree only understands 'male' | 'female'. Map 'other' to a value so
// the layout engine can still position the node (the card UI uses real gender).
type RTRelationType = 'blood' | 'married';
interface RTRelation {
  id: string;
  type: RTRelationType;
}
export interface RTNode {
  id: string;
  gender: 'male' | 'female';
  parents: RTRelation[];
  children: RTRelation[];
  siblings: RTRelation[];
  spouses: RTRelation[];
}

/**
 * Convert the canonical people list into the node graph that relatives-tree /
 * react-family-tree need. All four relation arrays are derived here so the
 * rendered tree is always consistent with the underlying data.
 */
export function toTreeNodes(people: Person[]): RTNode[] {
  return people.map((person) => {
    const parents = [person.fatherId, person.motherId].filter(
      (id): id is string => Boolean(id),
    );
    return {
      id: person.id,
      gender: person.gender === 'female' ? 'female' : 'male',
      parents: parents.map((id) => ({ id, type: 'blood' as const })),
      children: getChildren(person, people).map((c) => ({
        id: c.id,
        type: 'blood' as const,
      })),
      siblings: getSiblings(person, people).map((s) => ({
        id: s.id,
        type: 'blood' as const,
      })),
      spouses: person.spouseIds.map((id) => ({ id, type: 'married' as const })),
    };
  });
}

/**
 * Pick a sensible root for the tree: the oldest person who has no parents
 * recorded (a top-of-tree ancestor), falling back to the first person.
 */
export function defaultRootId(people: Person[]): string | undefined {
  if (people.length === 0) return undefined;
  const roots = people
    .filter((p) => !p.fatherId && !p.motherId)
    .sort(byBirthDate);
  return (roots[0] ?? people[0]).id;
}

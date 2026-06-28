import type { Person } from '../types';
import {
  supabase,
  isSupabaseConfigured,
  PHOTO_BUCKET,
} from '../lib/supabase';
import { personToRow, rowToPerson, type PersonRow } from './mapping';
import { sampleFamily } from '../data/sampleData';

/**
 * Storage abstraction the rest of the app talks to. Two implementations:
 *  - SupabaseRepo: real Postgres + Storage, edits persist for everyone.
 *  - DemoRepo:     in-memory copy of the sample family; edits live only for
 *                  the current session so the UI is fully explorable offline.
 */
export interface Repo {
  /** Whether writes are durable. false => show a "demo" banner. */
  readonly persistent: boolean;
  list(): Promise<Person[]>;
  upsert(person: Person): Promise<void>;
  remove(id: string): Promise<void>;
  uploadPhoto(file: File): Promise<string>;
}

class SupabaseRepo implements Repo {
  persistent = true;

  private get client() {
    if (!supabase) throw new Error('Supabase client is not configured.');
    return supabase;
  }

  async list(): Promise<Person[]> {
    const { data, error } = await this.client
      .from('people')
      .select('*')
      .order('birth_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return (data as PersonRow[]).map(rowToPerson);
  }

  async upsert(person: Person): Promise<void> {
    const { error } = await this.client
      .from('people')
      .upsert(personToRow(person));
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('people').delete().eq('id', id);
    if (error) throw error;
  }

  async uploadPhoto(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await this.client.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = this.client.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}

class DemoRepo implements Repo {
  persistent = false;
  // Deep copy so we never mutate the imported sample module.
  private people: Person[] = sampleFamily.map((p) => ({
    ...p,
    spouseIds: [...p.spouseIds],
  }));

  async list(): Promise<Person[]> {
    return this.people.map((p) => ({ ...p, spouseIds: [...p.spouseIds] }));
  }

  async upsert(person: Person): Promise<void> {
    const idx = this.people.findIndex((p) => p.id === person.id);
    const copy = { ...person, spouseIds: [...person.spouseIds] };
    if (idx >= 0) this.people[idx] = copy;
    else this.people.push(copy);
  }

  async remove(id: string): Promise<void> {
    this.people = this.people.filter((p) => p.id !== id);
  }

  async uploadPhoto(file: File): Promise<string> {
    // No backend in demo mode — embed the image as a local object URL.
    return URL.createObjectURL(file);
  }
}

export const repo: Repo = isSupabaseConfigured
  ? new SupabaseRepo()
  : new DemoRepo();

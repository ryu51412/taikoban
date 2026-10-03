// Supabase を設定していないときのデモ用データストア（プロセス内メモリ。再起動で元に戻る）
import { computeStats, type StatsRange } from "../stats";
import type { NewEvent, NewResponse, ReviewResponse, Store, StoreInput } from "../types";
import { buildSeed } from "./seed";
import type { Repo } from "./types";

type Db = ReturnType<typeof buildSeed>;
const g = globalThis as unknown as { __tkMemoryDb?: Db };
const db = (): Db => (g.__tkMemoryDb ??= buildSeed());
const clone = <T,>(v: T): T => structuredClone(v);

export const memoryRepo: Repo = {
  kind: "memory",
  async listStores() { return clone(db().stores); },
  async getStore(id) { return clone(db().stores.find((s) => s.id === id) ?? null); },
  async getStoreBySlug(slug) { return clone(db().stores.find((s) => s.slug === slug) ?? null); },
  async slugExists(slug) { return db().stores.some((s) => s.slug === slug); },
  async createStore(input) {
    const st: Store = { id: crypto.randomUUID(), mark: null, ...input, updatedAt: new Date().toISOString() };
    db().stores.push(st);
    return clone(st);
  },
  async updateStore(id, patch: Partial<StoreInput>) {
    const st = db().stores.find((s) => s.id === id);
    if (!st) return null;
    Object.assign(st, patch, { updatedAt: new Date().toISOString() });
    return clone(st);
  },
  async insertEvent(e: NewEvent) {
    db().events.push({ ...e, rating: e.rating ?? null, value: e.value ?? null, createdAt: e.createdAt ?? new Date().toISOString() });
  },
  async upsertResponse(r: NewResponse) {
    const list = db().responses;
    const existing = list.find((x) => x.sessionId === r.sessionId && x.route === r.route && x.storeId === r.storeId);
    if (existing) {
      Object.assign(existing, { rating: r.rating, tags: r.tags, text: r.text });
      return clone(existing);
    }
    const row: ReviewResponse = { id: crypto.randomUUID(), done: false, createdAt: new Date().toISOString(), ...r };
    list.unshift(row);
    return clone(row);
  },
  async listResponses(storeId, limit) {
    return clone(db().responses.filter((r) => r.storeId === storeId).slice(0, limit));
  },
  async setResponseDone(id, done, storeId) {
    const r = db().responses.find((x) => x.id === id && (storeId === null || x.storeId === storeId));
    if (!r) return false;
    r.done = done;
    return true;
  },
  async countOpenResponses() {
    const m = new Map<string, number>();
    for (const r of db().responses) if (!r.done) m.set(r.storeId, (m.get(r.storeId) ?? 0) + 1);
    return m;
  },
  async stats(range: StatsRange, storeId?: string) {
    const ids = storeId ? [storeId] : db().stores.map((s) => s.id);
    return computeStats(db().events as Parameters<typeof computeStats>[0], ids, range);
  },
};

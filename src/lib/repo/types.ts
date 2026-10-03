import type { NewEvent, NewResponse, ReviewResponse, Store, StoreInput, StoreStats } from "../types";
import type { StatsRange } from "../stats";

export interface Repo {
  readonly kind: "memory" | "supabase";
  listStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | null>;
  getStoreBySlug(slug: string): Promise<Store | null>;
  createStore(input: StoreInput & { slug: string }): Promise<Store>;
  updateStore(id: string, patch: Partial<StoreInput>): Promise<Store | null>;
  slugExists(slug: string): Promise<boolean>;

  insertEvent(e: NewEvent): Promise<void>;
  /** 同じセッション・同じ経路の回答は1件にまとめる（上書き） */
  upsertResponse(r: NewResponse): Promise<ReviewResponse>;
  listResponses(storeId: string, limit: number): Promise<ReviewResponse[]>;
  setResponseDone(id: string, done: boolean, storeId: string | null): Promise<boolean>;
  countOpenResponses(): Promise<Map<string, number>>;

  stats(range: StatsRange, storeId?: string): Promise<StoreStats[]>;
}

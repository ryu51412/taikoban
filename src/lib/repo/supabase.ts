// 本番用：Supabase（Postgres）。サーバー側だけで service role キーを使う。
// 権限チェックはアプリ側（src/lib/auth.ts）で行い、RLS は二重の守りとして設定している。
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { emptyStats, type StatsRange } from "../stats";
import type { NewEvent, NewResponse, ReviewResponse, Store, StoreInput, StoreStats } from "../types";
import type { Repo } from "./types";

let client: SupabaseClient | null = null;
export function adminClient(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

type StoreRow = {
  id: string; slug: string; name: string; mark: string | null; google_review_url: string; aspects: string[]; menus: string[];
  coupon_text: string | null; notify_email: string; status: Store["status"]; plan: Store["plan"]; notify_on: boolean; coupon_on: boolean; updated_at: string;
};
const toStore = (r: StoreRow): Store => ({
  id: r.id, slug: r.slug, name: r.name, mark: r.mark, googleReviewUrl: r.google_review_url, aspects: r.aspects ?? [], menus: r.menus ?? [],
  couponText: r.coupon_text, notifyEmail: r.notify_email ?? "", status: r.status, plan: r.plan, notifyOn: r.notify_on, couponOn: r.coupon_on, updatedAt: r.updated_at,
});
const fromInput = (p: Partial<StoreInput>) => {
  const o: Record<string, unknown> = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.googleReviewUrl !== undefined) o.google_review_url = p.googleReviewUrl;
  if (p.aspects !== undefined) o.aspects = p.aspects;
  if (p.menus !== undefined) o.menus = p.menus;
  if (p.couponText !== undefined) o.coupon_text = p.couponText;
  if (p.notifyEmail !== undefined) o.notify_email = p.notifyEmail;
  if (p.notifyOn !== undefined) o.notify_on = p.notifyOn;
  if (p.couponOn !== undefined) o.coupon_on = p.couponOn;
  if (p.status !== undefined) o.status = p.status;
  if (p.plan !== undefined) o.plan = p.plan;
  return o;
};

type ResponseRow = { id: string; store_id: string; session_id: string; rating: number; route: "google" | "form"; tags: string[]; text: string; done: boolean; created_at: string };
const toResponse = (r: ResponseRow): ReviewResponse => ({
  id: r.id, storeId: r.store_id, sessionId: r.session_id, rating: r.rating, route: r.route, tags: r.tags ?? [], text: r.text ?? "", done: r.done, createdAt: r.created_at,
});

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const supabaseRepo: Repo = {
  kind: "supabase",
  async listStores() {
    const rows = check(await adminClient().from("stores").select("*").order("created_at", { ascending: true }));
    return (rows as StoreRow[]).map(toStore);
  },
  async getStore(id) {
    const row = check(await adminClient().from("stores").select("*").eq("id", id).maybeSingle());
    return row ? toStore(row as StoreRow) : null;
  },
  async getStoreBySlug(slug) {
    const row = check(await adminClient().from("stores").select("*").eq("slug", slug).maybeSingle());
    return row ? toStore(row as StoreRow) : null;
  },
  async slugExists(slug) {
    const row = check(await adminClient().from("stores").select("id").eq("slug", slug).maybeSingle());
    return !!row;
  },
  async createStore(input) {
    const row = check(await adminClient().from("stores").insert({ slug: input.slug, ...fromInput(input) }).select("*").single());
    return toStore(row as StoreRow);
  },
  async updateStore(id, patch) {
    const row = check(await adminClient().from("stores").update({ ...fromInput(patch), updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle());
    return row ? toStore(row as StoreRow) : null;
  },
  async insertEvent(e: NewEvent) {
    check(await adminClient().from("events").insert({ store_id: e.storeId, session_id: e.sessionId, type: e.type, rating: e.rating ?? null, value: e.value ?? null }));
  },
  async upsertResponse(r: NewResponse) {
    const row = check(
      await adminClient()
        .from("responses")
        .upsert({ store_id: r.storeId, session_id: r.sessionId, rating: r.rating, route: r.route, tags: r.tags, text: r.text }, { onConflict: "store_id,session_id,route" })
        .select("*")
        .single(),
    );
    return toResponse(row as ResponseRow);
  },
  async listResponses(storeId, limit) {
    const rows = check(await adminClient().from("responses").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).limit(limit));
    return (rows as ResponseRow[]).map(toResponse);
  },
  async setResponseDone(id, done, storeId) {
    let q = adminClient().from("responses").update({ done }).eq("id", id);
    if (storeId) q = q.eq("store_id", storeId);
    const rows = check(await q.select("id"));
    return (rows as unknown[]).length > 0;
  },
  async countOpenResponses() {
    const rows = check(await adminClient().rpc("tk_open_response_counts"));
    const m = new Map<string, number>();
    for (const r of rows as { store_id: string; n: number }[]) m.set(r.store_id, Number(r.n));
    return m;
  },
  async stats(range: StatsRange, storeId?: string) {
    const rows = check(
      await adminClient().rpc("tk_store_stats", {
        p_from: range.from.toISOString(), p_to: range.to.toISOString(), p_prev_from: range.prevFrom.toISOString(),
        p_week_from: range.weekFrom.toISOString(), p_store: storeId ?? null,
      }),
    ) as Record<string, unknown>[];
    return rows.map((r): StoreStats => ({
      ...emptyStats(String(r.store_id)),
      taps: Number(r.taps), prevTaps: Number(r.prev_taps), starred: Number(r.starred), aspected: Number(r.aspected), posted: Number(r.posted),
      feedback: Number(r.feedback), ratings: (r.ratings as number[]).map(Number), prevStarred: Number(r.prev_starred), prevRatingSum: Number(r.prev_rating_sum),
      weekly: (r.weekly as number[]).map(Number), hours: (r.hours as number[]).map(Number),
    }));
  },
};

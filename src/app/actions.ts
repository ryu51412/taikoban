"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canAccessStore, getSessionUser, homeFor, signIn, signOut } from "@/lib/auth";
import { repo } from "@/lib/repo";
import type { StoreInput } from "@/lib/types";
import { EMAIL_RE, parseStoreInput } from "@/lib/validate";

export async function loginAction(email: string, password: string, remember: boolean) {
  if (!EMAIL_RE.test(email.trim())) return { ok: false as const, error: "メールアドレスの形式をご確認ください。" };
  if (password.length < 8) return { ok: false as const, error: "パスワードは8文字以上です。" };
  const r = await signIn(email.trim(), password, remember);
  if (!r.ok) return r;
  return { ok: true as const, to: homeFor(r.role) };
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}

export async function saveStoreAction(storeId: string, raw: Partial<Record<keyof StoreInput, unknown>>) {
  const u = await getSessionUser();
  if (!u || !canAccessStore(u, storeId)) return { ok: false as const, error: "この店舗を編集する権限がありません。" };
  const current = await repo().getStore(storeId);
  if (!current) return { ok: false as const, error: "店舗が見つかりません。" };
  // 公開状態とプランは運営だけが変えられる
  if (u.role !== "operator") { raw.status = current.status; raw.plan = current.plan; }
  const parsed = parseStoreInput(raw);
  if (!parsed.ok) return parsed;
  const saved = await repo().updateStore(storeId, parsed.value);
  if (!saved) return { ok: false as const, error: "保存できませんでした。" };
  revalidatePath("/", "layout");
  return { ok: true as const, store: saved };
}

function randomSlug() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function createStoreAction(raw: Partial<Record<keyof StoreInput, unknown>>) {
  const u = await getSessionUser();
  if (!u || u.role !== "operator") return { ok: false as const, error: "運営アカウントでログインしてください。" };
  const parsed = parseStoreInput({ ...raw, status: "準備中", plan: raw.plan ?? "ライト", notifyOn: true, couponOn: true });
  if (!parsed.ok) return parsed;
  let slug = randomSlug();
  while (await repo().slugExists(slug)) slug = randomSlug();
  const st = await repo().createStore({ ...parsed.value, slug });
  revalidatePath("/admin", "layout");
  return { ok: true as const, id: st.id, slug: st.slug };
}

export async function setResponseDoneAction(id: string, done: boolean) {
  const u = await getSessionUser();
  if (!u) return { ok: false as const };
  const ok = await repo().setResponseDone(id, done, u.role === "operator" ? null : u.storeId);
  if (ok) revalidatePath("/owner", "layout");
  return { ok };
}

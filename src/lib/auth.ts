import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./config";
import { DEMO_USERS } from "./repo/seed";
import { adminClient } from "./repo/supabase";
import { REMEMBER_COOKIE, REMEMBER_DAYS } from "./supabase/cookies";
import { supabaseServer } from "./supabase/server";
import type { Role, SessionUser } from "./types";

// ---------------- デモモード：署名付き HTTP-only Cookie ----------------
const DEMO_COOKIE = "tk_demo_session";
const secret = () => process.env.SESSION_SECRET || "taikoban-demo-only-secret";
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("base64url");

function readDemoToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid: string; exp: number };
    if (p.exp < Date.now()) return null;
    const u = DEMO_USERS.find((x) => x.id === p.uid);
    return u ? { id: u.id, email: u.email, role: u.role, storeId: u.storeId } : null;
  } catch {
    return null;
  }
}

// ---------------- 共通 API ----------------
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return readDemoToken((await cookies()).get(DEMO_COOKIE)?.value);

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await adminClient().from("profiles").select("role, store_id").eq("id", data.user.id).maybeSingle();
  if (!profile) return null;
  return { id: data.user.id, email: data.user.email ?? "", role: profile.role as Role, storeId: profile.store_id };
}

export const homeFor = (role: Role) => (role === "operator" ? "/admin" : "/owner");

/** ログイン必須の画面で使う。権限が違えばその人の画面へ移す */
export async function requireRole(role: Role): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (u.role !== role) redirect(homeFor(u.role));
  if (role === "owner" && !u.storeId) redirect("/login?e=nostore");
  return u;
}

export async function signIn(email: string, password: string, remember: boolean): Promise<{ ok: true; role: Role } | { ok: false; error: string }> {
  const jar = await cookies();
  jar.set(REMEMBER_COOKIE, remember ? "1" : "0", { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: REMEMBER_DAYS * 86400 });

  if (!isSupabaseConfigured()) {
    const u = DEMO_USERS.find((x) => x.email === email.toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: "メールアドレスまたはパスワードが違います。" };
    const exp = Date.now() + (remember ? REMEMBER_DAYS * 86400_000 : 12 * 3600_000);
    const body = Buffer.from(JSON.stringify({ uid: u.id, exp })).toString("base64url");
    jar.set(DEMO_COOKIE, `${body}.${sign(body)}`, {
      httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production",
      ...(remember ? { maxAge: REMEMBER_DAYS * 86400 } : {}),
    });
    return { ok: true, role: u.role };
  }

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { ok: false, error: "メールアドレスまたはパスワードが違います。" };
  const { data: profile } = await adminClient().from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    await sb.auth.signOut();
    return { ok: false, error: "このアカウントには店舗が登録されていません。サポートにお問い合わせください。" };
  }
  return { ok: true, role: profile.role as Role };
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  if (isSupabaseConfigured()) await (await supabaseServer()).auth.signOut();
}

/** 店舗へのアクセス権（オーナーは自分の店舗のみ、運営は全店舗） */
export function canAccessStore(u: SessionUser, storeId: string) {
  return u.role === "operator" || u.storeId === storeId;
}

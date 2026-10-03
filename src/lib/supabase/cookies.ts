import type { CookieOptions } from "@supabase/ssr";

export const REMEMBER_COOKIE = "tk_remember";
export const REMEMBER_DAYS = 30;

/** 「ログインを保持する」がオフなら、ブラウザを閉じるまでのセッション Cookie にする */
export function sessionCookieOptions(options: CookieOptions, remember: boolean): CookieOptions {
  const o: CookieOptions = { ...options, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" };
  const deleting = options.maxAge === 0;
  if (deleting) return o;
  if (!remember) { delete o.maxAge; delete o.expires; }
  else o.maxAge = REMEMBER_DAYS * 86400;
  return o;
}

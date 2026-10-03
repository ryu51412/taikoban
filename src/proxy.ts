import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REMEMBER_COOKIE, sessionCookieOptions } from "./lib/supabase/cookies";

// Supabase のセッション（アクセストークン）を更新する。デモモードでは何もしない
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.next();

  let response = NextResponse.next({ request });
  const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== "0";
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, sessionCookieOptions(options, remember));
        response.headers.set("Cache-Control", "private, no-store");
      },
    },
  });
  await sb.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*", "/login", "/pop/:path*"],
};

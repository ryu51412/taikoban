import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { REMEMBER_COOKIE, sessionCookieOptions } from "./cookies";

/** サーバーコンポーネント／サーバーアクション用（ユーザーのセッションで動く） */
export async function supabaseServer() {
  const store = await cookies();
  const remember = store.get(REMEMBER_COOKIE)?.value !== "0";
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, sessionCookieOptions(options, remember));
        } catch {
          // サーバーコンポーネントからは書けない。proxy.ts が更新する
        }
      },
    },
  });
}

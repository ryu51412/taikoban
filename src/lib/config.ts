/** Supabase の環境変数がそろっていれば本番モード。なければデモ（メモリ）モード */
export const isSupabaseConfigured = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const SUPPORT_EMAIL = "ryu.ishizaki514@gmail.com";

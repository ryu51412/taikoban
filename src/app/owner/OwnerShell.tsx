import type { ReactNode } from "react";
import { Shell } from "@/components/console/Shell";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import { storeMark } from "@/lib/stats";
import type { SessionUser, Store } from "@/lib/types";
import { redirect } from "next/navigation";

export async function loadOwner(): Promise<{ user: SessionUser; store: Store; open: number }> {
  const user = await requireRole("owner");
  const store = await repo().getStore(user.storeId!);
  if (!store) redirect("/login?e=nostore");
  const open = (await repo().countOpenResponses()).get(store.id) ?? 0;
  return { user, store, open };
}

export function OwnerShell({ active, user, store, open, children }: { active: "analytics" | "feedback" | "settings"; user: SessionUser; store: Store; open: number; children: ReactNode }) {
  const nav = [
    { key: "analytics", href: "/owner", label: "集計", badge: "" },
    { key: "feedback", href: "/owner/feedback", label: "届いたご意見", badge: String(open) },
    { key: "settings", href: "/owner/settings", label: "店舗設定・QR", badge: "" },
  ].map((n) => ({ ...n, active: n.key === active }));
  return (
    <Shell
      area="店舗管理" navLabel="STORE OWNER" nav={nav} user={user}
      plan={{ name: store.plan, note: store.plan === "スタンダード" ? "1店舗・ご意見通知つき" : "1店舗" }}
      headerExtra={
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: "#f7f2ea", border: "1px solid rgba(36,31,61,0.12)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: "#241f3d", color: "#ffffff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{storeMark(store)}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{store.name}</span>
            <span style={{ fontSize: 11, color: "#8b7f63" }}>オーナー権限</span>
          </div>
          <a href="/owner/feedback?filter=open" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "#fdf8ec", color: "#8a5f20", fontSize: 12, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#b8873a" }} />未対応のご意見 {open}
          </a>
        </>
      }
    >
      {children}
    </Shell>
  );
}

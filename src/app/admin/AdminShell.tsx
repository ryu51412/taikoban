import type { ReactNode } from "react";
import { Shell } from "@/components/console/Shell";
import type { SessionUser } from "@/lib/types";

export function AdminShell({ active, user, storeCount, detailId, children }: { active: "stores" | "new" | "detail" | "analytics"; user: SessionUser; storeCount: number; detailId?: string; children: ReactNode }) {
  const nav = [
    { key: "stores", href: "/admin", label: "店舗一覧", badge: String(storeCount) },
    { key: "new", href: "/admin/new", label: "新規ページ発行", badge: "" },
    { key: "detail", href: detailId ? `/admin/stores/${detailId}` : "/admin/stores", label: "店舗設定・QR", badge: "" },
    { key: "analytics", href: "/admin/analytics", label: "集計", badge: "" },
  ].map((n) => ({ ...n, active: n.key === active }));
  return (
    <Shell area="運営コンソール" navLabel="OPERATOR" nav={nav} user={user} plan={{ name: "運営アカウント", note: `${storeCount}店舗を管理中` }}>
      {children}
    </Shell>
  );
}

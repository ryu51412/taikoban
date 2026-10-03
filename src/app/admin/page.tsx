import type { Metadata } from "next";
import Link from "next/link";
import { KpiGrid } from "@/components/console/Panels";
import { PageTitle } from "@/components/console/PageTitle";
import { StatusBadge } from "@/components/console/StoreDetail";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/repo";
import { avgRating, currentRange, emptyStats, fmtAvg, fmtNum, fmtPct, reachPct, storeMark, sumStats } from "@/lib/stats";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = { title: "店舗一覧" };
export const dynamic = "force-dynamic";

const COLS = "minmax(0, 2.1fr) repeat(5, minmax(84px, 1fr))";

export default async function AdminStores() {
  const user = await requireRole("operator");
  const stores = await repo().listStores();
  const stats = new Map((await repo().stats(currentRange())).map((s) => [s.storeId, s]));
  const total = sumStats([...stats.values()]);

  return (
    <AdminShell active="stores" user={user} storeCount={stores.length} detailId={stores[0]?.id}>
      <div className="tk-fade">
        <PageTitle title="店舗一覧" sub={`${stores.length}店舗・直近30日のタップ合計 ${fmtNum(total.taps)}回`}>
          <Link href="/admin/new" className="h-purple" style={{ padding: "11px 18px", borderRadius: 999, background: "#6852c1", color: "#ffffff", fontSize: 13.5, fontWeight: 700 }}>＋ 新しい店舗ページを発行</Link>
        </PageTitle>

        <KpiGrid size={22} compact items={[
          { label: "管理店舗", value: String(stores.length) },
          { label: "直近30日のタップ数", value: fmtNum(total.taps) },
          { label: "平均★", value: fmtAvg(avgRating(total)) },
          { label: "投稿到達率", value: fmtPct(reachPct(total)) },
        ]} />

        <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "12px 18px", background: "#faf7f1", borderBottom: "1px solid rgba(36,31,61,0.1)", fontSize: 11.5, fontWeight: 700, color: "#6e6693" }}>
                <div>店舗</div><div>プラン</div><div>タップ数</div><div>平均★</div><div>投稿到達</div><div>状態</div>
              </div>
              {stores.map((st) => {
                const s = stats.get(st.id) ?? emptyStats(st.id);
                return (
                  <Link key={st.id} href={`/admin/stores/${st.id}`} className="h-cream-row"
                    style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, alignItems: "center", width: "100%", padding: "14px 18px", borderBottom: "1px solid rgba(36,31,61,0.07)", background: "#ffffff", color: "#241f3d" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 8, background: "#f1edfb", color: "#52409c", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{storeMark(st)}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{st.name}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6e6693" }}>{st.plan}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.taps ? fmtNum(s.taps) : "—"}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#6852c1" }}>{fmtAvg(avgRating(s))}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtPct(reachPct(s))}</div>
                    <div><StatusBadge status={st.status} /></div>
                  </Link>
                );
              })}
              {stores.length === 0 && <div style={{ padding: "28px 18px", textAlign: "center", fontSize: 13, color: "#6e6693" }}>まだ店舗がありません。「新しい店舗ページを発行」から作成してください。</div>}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

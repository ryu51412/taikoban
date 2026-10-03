"use client";

import { useState } from "react";
import { setResponseDoneAction } from "@/app/actions";
import { BarRows, KpiGrid } from "@/components/console/Panels";
import { PageTitle } from "@/components/console/PageTitle";
import { pill } from "@/components/console/StoreDetail";
import { Toast, useToast } from "@/components/Toast";
import type { ReviewResponse } from "@/lib/types";

export type FbFilter = "すべて" | "Google投稿" | "ご意見フォーム" | "未対応";
type Item = ReviewResponse & { when: string };

export function FeedbackList({ items, initialFilter }: { items: Item[]; initialFilter: FbFilter }) {
  const [filter, setFilter] = useState<FbFilter>(initialFilter);
  const [done, setDone] = useState<Record<string, boolean>>(() => Object.fromEntries(items.map((x) => [x.id, x.done])));
  const [toast, showToast] = useToast();

  const formOnly = items.filter((x) => x.route === "form");
  const googleOnly = items.filter((x) => x.route === "google");
  const openCount = items.filter((x) => !done[x.id]).length;
  const list = items.filter((x) =>
    filter === "すべて" ? true : filter === "Google投稿" ? x.route === "google" : filter === "ご意見フォーム" ? x.route === "form" : !done[x.id]);

  const tagCounts = new Map<string, number>();
  formOnly.forEach((x) => x.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const tagRows = [...tagCounts].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
  const tagMax = tagRows[0]?.n ?? 1;

  const toggle = async (id: string) => {
    const next = !done[id];
    setDone((d) => ({ ...d, [id]: next }));
    try {
      const r = await setResponseDoneAction(id, next);
      if (!r.ok) throw new Error();
    } catch {
      setDone((d) => ({ ...d, [id]: !next }));
      showToast("更新できませんでした");
    }
  };

  return (
    <div className="tk-fade">
      <PageTitle
        title="届いたご意見"
        sub={`Googleに投稿された口コミの下書きと、お店にだけ届いたご意見の両方です。直近 ${items.length} 件の回答（Google投稿 ${googleOnly.length} / ご意見フォーム ${formOnly.length}）・未対応 ${openCount} 件`}
      />

      <KpiGrid min={150} size={22} items={[
        { label: "直近の回答", value: String(items.length), sub: `Google投稿 ${googleOnly.length} 件` },
        { label: "ご意見フォーム", value: String(formOnly.length), sub: "お店に直接届いた回答" },
        { label: "未対応", value: String(openCount), sub: openCount ? "対応をお願いします" : "すべて確認済み" },
        { label: "最多の指摘", value: tagRows[0]?.label ?? "—", sub: tagRows[0] ? `${tagRows[0].n}件（${Math.round((tagRows[0].n / formOnly.length) * 100)}%）` : "—" },
      ]} />

      <div style={{ marginTop: 12, background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)", borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>ご意見フォームで指摘された内容</div>
        {tagRows.length ? (
          <BarRows labelWidth={92} valueWidth={38} track="#f4f1ea" rows={tagRows.map((r) => ({ label: r.label, value: `${r.n}件`, pct: Math.round((r.n / tagMax) * 100), color: r.n === tagMax ? "#b8873a" : "#c9b89a" }))} />
        ) : (
          <div style={{ fontSize: 12.5, color: "#6e6693", marginTop: 12 }}>まだ指摘はありません。</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
        {(["すべて", "Google投稿", "ご意見フォーム", "未対応"] as FbFilter[]).map((f) => (
          <button key={f} type="button" style={pill(filter === f)} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
        ))}
        <div style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12, color: "#6e6693" }}>{list.length} 件を表示</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {list.length === 0 && (
          <div style={{ background: "#ffffff", border: "1px dashed rgba(36,31,61,0.16)", borderRadius: 16, padding: "28px 20px", textAlign: "center", fontSize: 13, color: "#6e6693" }}>
            {filter === "未対応" ? "未対応のご意見はありません。" : "まだ回答はありません。QRコードを置いてお客様に読み取ってもらいましょう。"}
          </div>
        )}
        {list.map((f) => {
          const isDone = !!done[f.id];
          const isG = f.route === "google";
          return (
            <div key={f.id} style={{ background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)", borderRadius: 16, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ color: "#b8873a", fontSize: 13, letterSpacing: "0.1em" }} aria-label={`★${f.rating}`}>{"★".repeat(f.rating) + "☆".repeat(5 - f.rating)}</span>
                <span style={{ fontSize: 12, color: "#8b7f63" }}>{f.when}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: isG ? "#f1edfb" : "#faf1e2", color: isG ? "#52409c" : "#8a5f20" }}>{isG ? "Googleに投稿" : "ご意見フォーム"}</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: isDone ? "#eaf3ee" : "#fdf8ec", color: isDone ? "#2f6b4f" : "#8a5f20" }}>{isDone ? (isG ? "確認済み" : "対応済み") : "未対応"}</span>
                  <button type="button" className="h-white" onClick={() => toggle(f.id)}
                    style={{ padding: "7px 13px", borderRadius: 999, border: "1px solid rgba(36,31,61,0.16)", background: "#ffffff", fontFamily: "inherit", fontSize: 11.5, fontWeight: 700, color: "#4b4272", cursor: "pointer" }}>
                    {isDone ? "未対応に戻す" : isG ? "確認済みにする" : "対応済みにする"}
                  </button>
                </div>
              </div>
              {f.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {f.tags.map((t) => <span key={t} style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "#faf7f1", border: "1px solid rgba(36,31,61,0.1)", color: "#6e6693" }}>{t}</span>)}
                </div>
              )}
              <p style={{ fontSize: 13.5, lineHeight: 1.85, color: "#241f3d", margin: "10px 0 0", whiteSpace: "pre-wrap" }}>{f.text || "（記入なし）"}</p>
            </div>
          );
        })}
      </div>
      <Toast msg={toast} />
    </div>
  );
}

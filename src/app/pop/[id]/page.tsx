import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { TablePop, type PopTone } from "@/components/TablePop";
import { canAccessStore, getSessionUser } from "@/lib/auth";
import { siteOrigin } from "@/lib/origin";
import { repo } from "@/lib/repo";
import { PrintBar } from "./PrintBar";

export const metadata: Metadata = { title: "卓上POP（印刷用）", robots: { index: false } };
export const dynamic = "force-dynamic";

// A6（105×148mm）に収まるよう POP（幅240px・高さ約450px）を拡大して印刷する
export default async function PopPrint(props: PageProps<"/pop/[id]">) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await props.params;
  if (!canAccessStore(user, id)) notFound();
  const store = await repo().getStore(id);
  if (!store) notFound();
  const t = (await props.searchParams).tone;
  const tone: PopTone = t === "white" || t === "dark" ? t : "paper";
  const url = `${await siteOrigin()}/r/${store.slug}`;
  const svg = (await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: tone === "dark" ? "#231f2c" : "#241f3d", light: "#ffffff" } }))
    .replace("<svg ", '<svg width="100%" height="100%" ');

  return (
    <div style={{ minHeight: "100vh", background: "#efe9dd", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px 16px" }}>
      <style>{`@page { size: A6 portrait; margin: 0; } @media print { .pop-wrap { padding: 0 !important; } body { margin: 0; } }`}</style>
      <PrintBar name={store.name} />
      <div className="pop-wrap" style={{ width: "105mm", height: "148mm", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", boxShadow: "0 18px 36px -24px rgba(36,31,61,0.5)" }}>
        <TablePop tone={tone} name={store.name} coupon={store.couponOn ? store.couponText : null} qrSvg={svg} zoom={1.2} flat />
      </div>
    </div>
  );
}

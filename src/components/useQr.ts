"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** URL から QR の SVG 文字列を作る（誤り訂正 M・余白なし） */
export function useQrSvg(url: string, dark = "#241f3d") {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark, light: "#ffffff" } })
      .then((s) => { if (alive) setSvg(s.replace("<svg ", '<svg width="100%" height="100%" ')); })
      .catch(() => {});
    return () => { alive = false; };
  }, [url, dark]);
  return svg;
}

export async function downloadQr(url: string, kind: "png" | "svg", filename: string) {
  let href: string;
  if (kind === "png") {
    href = await QRCode.toDataURL(url, { width: 1200, margin: 4, errorCorrectionLevel: "M", color: { dark: "#241f3d", light: "#ffffff" } });
  } else {
    const svg = await QRCode.toString(url, { type: "svg", margin: 4, errorCorrectionLevel: "M", color: { dark: "#241f3d", light: "#ffffff" } });
    href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }
  const a = document.createElement("a");
  a.href = href; a.download = `${filename}.${kind}`;
  document.body.appendChild(a); a.click(); a.remove();
  if (kind === "svg") setTimeout(() => URL.revokeObjectURL(href), 2000);
}

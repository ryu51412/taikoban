"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 画面下中央のトースト（2〜2.2秒で消える） */
export function useToast(ms = 2200) {
  const [msg, setMsg] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), ms);
  }, [ms]);
  return [msg, show] as const;
}

export function Toast({ msg, tone = "console" }: { msg: string; tone?: "console" | "review" }) {
  const review = tone === "review";
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", left: "50%", bottom: 24, transform: `translateX(-50%) translateY(${msg ? "0" : "8px"})`,
        background: review ? "#2a2350" : "#241f3d", color: review ? "#f3ece1" : "#f7f2ea", fontSize: 13, fontWeight: 700,
        padding: "11px 20px", borderRadius: 999, boxShadow: review ? "0 16px 30px -14px rgba(42,35,80,0.8)" : "0 18px 32px -16px rgba(36,31,61,0.8)",
        opacity: msg ? 1 : 0, pointerEvents: "none", transition: "opacity .25s ease, transform .25s ease", zIndex: 40, width: "max-content", maxWidth: "88vw", textAlign: "center",
      }}
    >
      {msg}
    </div>
  );
}

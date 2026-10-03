"use client";

import { useEffect } from "react";

/** [data-anim] の付いたブロックを、画面に入ったらふわっと出す（同じ行は90msずつずらす） */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-anim]"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const sibs = Array.from(el.parentElement?.children ?? []).filter((n) => n.hasAttribute("data-anim"));
        const i = Math.max(0, sibs.indexOf(el));
        setTimeout(() => { el.style.opacity = "1"; el.style.transform = "none"; }, Math.min(i, 4) * 90);
        io.unobserve(el);
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.88) continue; // 最初から見えているものはそのまま
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity .6s cubic-bezier(.2,.7,.3,1), transform .6s cubic-bezier(.2,.7,.3,1)";
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return null;
}

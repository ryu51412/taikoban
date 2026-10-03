import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions";
import type { SessionUser } from "@/lib/types";

export type NavItem = { href: string; label: string; badge?: string; active: boolean };

const initials = (email: string) => (email.split("@")[0].replace(/[^a-zA-Z]/g, "").slice(0, 2) || "ME").toUpperCase();

export function Shell(props: {
  area: "店舗管理" | "運営コンソール";
  navLabel: string;
  nav: NavItem[];
  plan: { name: string; note: string };
  user: SessionUser;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f2ea", display: "flex", flexDirection: "column", lineHeight: 1.7 }}>
      <header className="no-print" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid rgba(36,31,61,0.1)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(140deg, #6852c1, #8474cd)", color: "#ffffff", fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</span>
          <span style={{ fontSize: 15, fontWeight: 900 }}>太鼓判くん</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8b7f63", letterSpacing: "0.06em", paddingLeft: 2 }}>{props.area}</span>
        </div>
        <div style={{ flex: 1, minWidth: 20 }} />
        {props.headerExtra}
        <details style={{ position: "relative" }}>
          <summary aria-label="アカウント" title={props.user.email} style={{ listStyle: "none", cursor: "pointer", width: 30, height: 30, borderRadius: 999, background: "#241f3d", color: "#ffffff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {initials(props.user.email)}
          </summary>
          <div style={{ position: "absolute", right: 0, top: 38, minWidth: 220, background: "#ffffff", border: "1px solid rgba(36,31,61,0.12)", borderRadius: 14, padding: 12, boxShadow: "0 18px 32px -18px rgba(36,31,61,0.5)", zIndex: 30 }}>
            <div style={{ fontSize: 11.5, color: "#6e6693", padding: "2px 4px 10px", wordBreak: "break-all" }}>{props.user.email}</div>
            <form action={logoutAction}>
              <button type="submit" className="h-white" style={{ width: "100%", padding: "9px 12px", borderRadius: 999, border: "1px solid rgba(36,31,61,0.16)", background: "#ffffff", fontSize: 12.5, fontWeight: 700, color: "#241f3d", cursor: "pointer" }}>ログアウト</button>
            </form>
          </div>
        </details>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", flex: 1, alignItems: "stretch" }}>
        <nav className="tk-nav no-print" style={{ flex: "1 1 216px", maxWidth: 260, minWidth: 200, padding: "18px 12px", borderRight: "1px solid rgba(36,31,61,0.1)", display: "flex", flexDirection: "column", gap: 3, alignSelf: "flex-start", position: "sticky", top: 56 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", color: "#a49b7f", padding: "0 12px 10px" }}>{props.navLabel}</div>
          {props.nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={n.active ? "page" : undefined}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", padding: "10px 12px", borderRadius: 11, fontSize: 13, textAlign: "left", background: n.active ? "#f1edfb" : "transparent", color: n.active ? "#52409c" : "#6e6693", fontWeight: n.active ? 700 : 400 }}>
              <span>{n.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a49b7f" }}>{n.badge}</span>
            </Link>
          ))}
          <div className="tk-nav-plan" style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#f1edfb", border: "1px solid rgba(104,82,193,0.18)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#52409c" }}>{props.plan.name}</div>
            <div style={{ fontSize: 11.5, color: "#6e6693", marginTop: 4, lineHeight: 1.7 }}>{props.plan.note}</div>
          </div>
        </nav>
        <main className="tk-main" style={{ flex: "1 1 620px", minWidth: 0, padding: "24px 26px 56px" }}>{props.children}</main>
      </div>
    </div>
  );
}

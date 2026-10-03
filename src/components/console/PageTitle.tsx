import type { ReactNode } from "react";

export function PageTitle({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{title}</h1>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6e6693" }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

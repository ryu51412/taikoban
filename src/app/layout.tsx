import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: { default: "太鼓判くん｜お客様の“太鼓判”を、Googleの口コミへ。", template: "%s｜太鼓判くん" },
  description: "レジ横にQRコードを置くだけ。お客様が★でその日の満足度を伝えると、自然な口コミの下書きができ、そのままGoogleへ。店舗向けの口コミ支援サービスです。",
};

export const viewport: Viewport = { themeColor: "#6852c1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={noto.variable}>
      <body>{children}</body>
    </html>
  );
}

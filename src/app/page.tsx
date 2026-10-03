import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

const CONTACT_HREF = "mailto:ryu.ishizaki514@gmail.com?subject=%E5%A4%AA%E9%BC%93%E5%88%A4%E3%81%8F%E3%82%93%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%AE%E3%81%94%E7%9B%B8%E8%AB%87";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const wrap: CSSProperties = { maxWidth: 1060, margin: "0 auto", padding: "0 24px" };
const section: CSSProperties = { padding: "clamp(52px, 7vw, 84px) 0" };
const eyebrow: CSSProperties = { fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#6852c1" };
const h2: CSSProperties = { fontSize: "clamp(22px, 3.3vw, 31px)", fontWeight: 900, marginTop: 10, lineHeight: 1.55 };
const whiteCard: CSSProperties = { background: "#ffffff", border: "1px solid rgba(36,31,61,0.1)" };

const WORRIES = [
  ["01", "声かけは、届いても残らない", "「良かったら口コミお願いします」と伝えても、実際に書いてくれるお客様は一部だけ。"],
  ["02", "常連さんの満足が、形にならない", "満足してくれた常連さんほど、わざわざ文章を書く手間をかけてくれない。"],
  ["03", "投稿画面で、手が止まる", "何を書けばいいか分からず、口コミ欄の前で手が止まってしまう。"],
  ["04", "本音を聞く機会がない", "気になるご意見があっても、直接聞く機会がなく、次に活かしづらい。"],
];

function Tap({ n, time, title, body, highlight, children }: { n: number; time: string; title: string; body: string; highlight?: boolean; children: ReactNode }) {
  return (
    <div data-anim="" style={{ background: "#ffffff", border: highlight ? "2px solid #6852c1" : "1px solid rgba(36,31,61,0.1)", borderRadius: 20, padding: "20px 18px 22px", boxShadow: highlight ? "0 22px 42px -26px rgba(104,82,193,0.6)" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 900, color: "#6852c1", letterSpacing: "0.08em" }}>TAP {n}</span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#a49b7f" }}>{time}</span>
      </div>
      {children}
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 16 }}>{title}</div>
      <p style={{ fontSize: 13, color: "#6e6693", marginTop: 6, lineHeight: 1.8 }}>{body}</p>
    </div>
  );
}

function Feature({ n, title, body, children }: { n: string; title: string; body: string; children: ReactNode }) {
  return (
    <div data-anim="" style={{ ...whiteCard, borderRadius: 20, padding: "28px 26px", boxShadow: "0 1px 2px rgba(36,31,61,0.05), 0 22px 42px -28px rgba(104,82,193,0.5)" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: "#b8873a" }}>FEATURE {n}</div>
      <div style={{ fontSize: 16.5, fontWeight: 700, marginTop: 12, lineHeight: 1.6 }}>{title}</div>
      <p style={{ fontSize: 14, color: "#6e6693", marginTop: 10, lineHeight: 1.9 }}>{body}</p>
      {children}
    </div>
  );
}

const Star = ({ size, color, delay }: { size: number; color?: string; delay?: number }) => (
  <span style={{ fontSize: size, lineHeight: 1, color, display: "inline-block", animation: delay !== undefined ? `starPop 4.4s ease-in-out ${delay}s infinite` : undefined }}>★</span>
);

export default function Landing() {
  return (
    <div className="landing" style={{ background: "#f7f2ea", fontSize: 16, lineHeight: 1.85 }}>
      <style>{`.landing h1, .landing h2, .landing h3, .landing p { margin: 0; text-wrap: pretty; } html { scroll-behavior: smooth; }`}</style>
      <Reveal />

      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(247,242,234,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(36,31,61,0.1)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 17, color: "#241f3d" }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(140deg, #6852c1, #8474cd)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, flex: "none", boxShadow: "0 8px 16px -8px rgba(104,82,193,0.9)" }}>判</span>
            太鼓判くん
          </a>
          <a href="#contact" className="h-purple" style={{ fontWeight: 700, fontSize: 13.5, padding: "11px 20px", borderRadius: 999, background: "#6852c1", color: "#ffffff", whiteSpace: "nowrap" }}>お問い合わせ</a>
        </div>
      </nav>

      <div id="top" />

      <header style={{ background: "linear-gradient(158deg, #6852c1 0%, #7b67c9 55%, #8474cd 100%)", color: "#ffffff", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "clamp(48px, 7vw, 84px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "clamp(32px, 5vw, 56px)", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.82)" }}>飲食店・店舗様向け　口コミサポートツール</div>
            <h1 style={{ fontSize: "clamp(30px, 4.6vw, 47px)", fontWeight: 900, lineHeight: 1.38, marginTop: 16, letterSpacing: "0.005em" }}>お客様の“太鼓判”を、<br />Googleの口コミへ。</h1>
            <p style={{ fontSize: 16.5, color: "rgba(255,255,255,0.86)", marginTop: 20, maxWidth: "46ch", lineHeight: 1.95 }}>レジ横にQRコードを置くだけ。お客様が★でその日の満足度を伝えると、数秒で自然な口コミの下書きが完成し、そのままGoogleへ。もう少し詳しい感想は、お店にだけそっと届けることもできます。</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              <a href="#contact" className="h-hero-white" style={{ fontWeight: 700, fontSize: 15, borderRadius: 999, padding: "15px 28px", background: "#ffffff", color: "#6852c1", boxShadow: "0 24px 46px -22px rgba(36,31,61,0.7)" }}>お問い合わせ・ご相談</a>
              <a href="#how" className="h-hero-ghost" style={{ fontWeight: 700, fontSize: 15, borderRadius: 999, padding: "15px 28px", background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1.5px solid rgba(255,255,255,0.55)" }}>仕組みを見る</a>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 30, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              <span>アプリ不要</span><span>会員登録なし</span><span>1店舗から導入可</span>
            </div>
          </div>

          <div>
            <div style={{ width: "min(282px, 84vw)", margin: "0 auto", borderRadius: 36, background: "#16112b", animation: "floatY 6.5s ease-in-out infinite", padding: 12, boxShadow: "0 34px 60px -24px rgba(22,17,43,0.75)" }}>
              <div style={{ background: "#f7f2ea", borderRadius: 26, overflow: "hidden", padding: "18px 14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 6, background: "#6852c1", color: "#ffffff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#8b7f63", letterSpacing: "0.06em" }}>太鼓判くん</span>
                  </div>
                  <span style={{ fontSize: 9, color: "#8b7f63" }}>STEP 1 / 4</span>
                </div>
                <div style={{ background: "#ffffff", borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 22px -14px rgba(36,31,61,0.5)" }}>
                  <div style={{ background: "linear-gradient(155deg, #6852c1, #8474cd)", padding: "16px 14px", textAlign: "center", color: "#ffffff" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.85)" }}>ご来店ありがとうございました</div>
                    <div style={{ fontSize: 15, fontWeight: 900, marginTop: 5 }}>〇〇食堂</div>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 12 }}>
                      {[18, 13, 13, 13].map((w, i) => <span key={i} style={{ height: 3, width: w, borderRadius: 999, background: i === 0 ? "#ffffff" : "rgba(255,255,255,0.32)", display: "block" }} />)}
                    </div>
                  </div>
                  <div style={{ padding: "16px 14px 18px", textAlign: "center" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#241f3d" }}>今日のお食事はいかがでしたか？</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 1, marginTop: 10 }} aria-hidden>
                      {[0, 0.1, 0.2, 0.3].map((d) => <Star key={d} size={23} color="#6852c1" delay={d} />)}
                      <Star size={23} color="#ded5ef" />
                    </div>
                    <div style={{ marginTop: 14, padding: 10, borderRadius: 999, background: "#6852c1", color: "#ffffff", fontSize: 10.5, fontWeight: 700 }}>コピーしてGoogleに投稿</div>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginTop: 14 }}>※実際の画面イメージ（店舗名・内容はサンプルです）</p>
          </div>
        </div>
      </header>

      <section style={section}>
        <div style={wrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(290px, 100%), 1fr))", gap: "clamp(24px, 4vw, 48px)", alignItems: "start" }}>
            <div>
              <div style={eyebrow}>こんなお悩み、ありませんか</div>
              <h2 style={h2}>口コミは、お願いするだけでは増えません。</h2>
              <p style={{ fontSize: 15, color: "#6e6693", marginTop: 16, lineHeight: 1.9 }}>満足してくださったお客様は、たしかにいる。けれど「文章を書く」という最後のひと手間が、その気持ちを止めてしまいます。</p>
              <div style={{ ...whiteCard, marginTop: 22, padding: "20px 22px", borderRadius: 18 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", color: "#b8873a" }}>つまずくのは、この一点</div>
                <p style={{ fontSize: 15, fontWeight: 700, marginTop: 8, lineHeight: 1.8 }}>お客様が「何を書けばいいか」で止まる。</p>
                <p style={{ fontSize: 13.5, color: "#6e6693", marginTop: 8, lineHeight: 1.85 }}>お店の声かけでも、割引でも、この手間は減りません。減らせるのは、書く作業そのものだけです。</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {WORRIES.map(([n, t, b]) => (
                <div key={n} data-anim="" style={{ ...whiteCard, borderRadius: 18, padding: "20px 22px", display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#6852c1", letterSpacing: "0.06em", paddingTop: 3 }}>{n}</div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.6 }}>{t}</div>
                    <p style={{ fontSize: 13.5, color: "#6e6693", marginTop: 6, lineHeight: 1.85 }}>{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-anim="" style={{ marginTop: "clamp(28px, 4vw, 44px)", padding: "clamp(24px, 3.5vw, 34px)", borderRadius: 22, background: "#f1edfb", border: "1px solid rgba(104,82,193,0.22)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 20, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.08em", color: "#6852c1" }}>太鼓判くんの答え</div>
              <p style={{ fontSize: "clamp(17px, 2.2vw, 20px)", fontWeight: 900, marginTop: 8, lineHeight: 1.7 }}>★をタップするだけで、<br />口コミの下書きが自動で生成されます。</p>
              <p style={{ fontSize: 13.5, color: "#6e6693", marginTop: 8, lineHeight: 1.85 }}>お客様の作業は「★をタップ」だけ。生成された下書きはそのまま投稿でき、書き直しも自由です。</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <a href="#how" className="h-purple" style={{ fontWeight: 700, fontSize: 14.5, borderRadius: 999, padding: "14px 26px", background: "#6852c1", color: "#ffffff", whiteSpace: "nowrap" }}>仕組みを見る →</a>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={{ ...section, background: "#f1edfb" }}>
        <div style={wrap}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: "56ch" }}>
              <div style={eyebrow}>使い方（お客様の画面）</div>
              <h2 style={h2}>お客様がすることは、たった4タップ。</h2>
              <p style={{ color: "#6e6693", marginTop: 12, fontSize: 15, lineHeight: 1.9 }}>お店がやることはQRコードを置くだけ。あとの流れは、すべてお客様のスマホの中で完結します。</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 999, background: "#ffffff", border: "1px solid rgba(104,82,193,0.22)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#6852c1" }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>最短 約30秒でGoogleへ</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(212px, 1fr))", gap: 14, marginTop: 36, alignItems: "start" }}>
            <Tap n={1} time="0:00" title="QRにスマホを向ける" body="カメラをかざすだけ。アプリのインストールも会員登録も不要です。">
              <div style={{ marginTop: 14, height: 148, borderRadius: 14, background: "#f1edfb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 84, height: 140, borderRadius: 16, background: "#241f3d", padding: 7, boxShadow: "0 14px 24px -14px rgba(36,31,61,0.7)" }}>
                  <div style={{ height: "100%", borderRadius: 11, background: "#3b3459", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: 8, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: "10%", right: "10%", height: 2, borderRadius: 999, background: "linear-gradient(90deg, rgba(200,185,143,0), #c9b98f, rgba(200,185,143,0))", animation: "scanY 2.4s ease-in-out infinite" }} />
                    <div style={{ width: 52, height: 52, borderRadius: 6, backgroundImage: "repeating-linear-gradient(45deg, #ffffff 0 4px, #8b83b0 4px 8px)", border: "2px solid rgba(255,255,255,0.85)" }} />
                    <div style={{ fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.04em" }}>読み取り中</div>
                  </div>
                </div>
              </div>
            </Tap>
            <Tap n={2} time="0:05" title="★で満足度をタップ" body="感覚のまま1〜5を選ぶだけ。ここから先は自動で進みます。">
              <div style={{ marginTop: 14, height: 148, borderRadius: 14, background: "linear-gradient(155deg, #6852c1, #8474cd)", padding: "16px 12px", textAlign: "center", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>今日のお食事は<br />いかがでしたか？</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 1, marginTop: 12 }} aria-hidden>
                  {[0, 1, 2, 3].map((i) => <Star key={i} size={19} />)}
                  <Star size={19} color="rgba(255,255,255,0.38)" />
                </div>
              </div>
            </Tap>
            <Tap n={3} time="0:12" title="決め手を選ぶ" body="むずかしく考えず、印象に残ったものをひとつ。メニューも同じ要領です。">
              <div style={{ marginTop: 14, height: 148, borderRadius: 14, background: "#f8f6fd", border: "1px solid rgba(104,82,193,0.18)", padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4b4272" }}>今日の決め手は？</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "7px 12px", borderRadius: 999, background: "#6852c1", color: "#ffffff" }}>雰囲気</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "7px 12px", borderRadius: 999, background: "#ffffff", border: "1.5px solid #ded5ef", color: "#4b4272" }}>接客</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "7px 12px", borderRadius: 999, background: "#ffffff", border: "1.5px solid #ded5ef", color: "#4b4272" }}>料理</span>
                </div>
              </div>
            </Tap>
            <Tap n={4} time="0:25" highlight title="下書きが自動で完成、そのまま投稿" body="下書きは自動生成。1タップでコピーしてGoogleの投稿画面へ。書き直しも自由です。">
              <div style={{ marginTop: 14, height: 148, borderRadius: 14, background: "#f8f6fd", border: "1px solid rgba(104,82,193,0.18)", padding: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10.5, color: "#4b4272", lineHeight: 1.75 }}>〇〇食堂に伺いました。お店の雰囲気がとても良く、リラックスして過ごせました。名物の定食が特においしかったです。</div>
                <div style={{ padding: 9, borderRadius: 999, background: "#6852c1", color: "#ffffff", fontSize: 10.5, fontWeight: 700, textAlign: "center" }}>コピーしてGoogleに投稿</div>
              </div>
            </Tap>
          </div>

          <div data-anim="" style={{ marginTop: 16, padding: "18px 22px", borderRadius: 18, background: "#ffffff", border: "1px dashed rgba(104,82,193,0.4)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "#b8873a", color: "#fdf8ec", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>判</span>
            <p style={{ fontSize: 13.5, color: "#4b4272", lineHeight: 1.8, flex: "1 1 240px" }}>★の数にかかわらず、Googleに投稿するかどうかはお客様が自由に選べます。お店に直接伝えたいことがあるときは<strong style={{ fontWeight: 700 }}>ご意見フォーム</strong>も選べるので、人目を気にせず伝えられる本当の声もお店に残ります。</p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={wrap}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: "58ch" }}>
              <div style={eyebrow}>太鼓判くんの特長</div>
              <h2 style={h2}>お店にも、お客様にも、無理をさせない設計。</h2>
            </div>
            <p style={{ fontSize: 13.5, color: "#6e6693", maxWidth: "34ch", lineHeight: 1.85 }}>増やすために手間を増やさない。それが設計の前提です。</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(290px, 100%), 1fr))", gap: 16, marginTop: 36 }}>
            <div data-anim="" style={{ gridColumn: "1 / -1", background: "linear-gradient(150deg, #2b2450 0%, #3b2f6b 55%, #4b3b8a 100%)", color: "#ffffff", borderRadius: 24, padding: "clamp(26px, 3.6vw, 40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "clamp(24px, 4vw, 44px)", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.14em", color: "#c9b98f" }}>FEATURE 01</div>
                <div style={{ fontSize: "clamp(19px, 2.4vw, 25px)", fontWeight: 900, marginTop: 12, lineHeight: 1.6 }}>QRコードひとつで導入完了</div>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.8)", marginTop: 12, lineHeight: 1.9, maxWidth: "40ch" }}>アプリのインストールや会員登録は不要。お客様はカメラでQRを読み取るだけで、その場で回答を始められます。</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {["工事なし", "機材なし", "レジ横に置くだけ"].map((t) => (
                    <span key={t} style={{ fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "min(240px, 78vw)", background: "#ffffff", borderRadius: 18, padding: "20px 18px", textAlign: "center", color: "#241f3d", boxShadow: "0 26px 46px -24px rgba(0,0,0,0.6)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6852c1" }}>口コミ、お待ちしています</div>
                  <div style={{ margin: "14px auto 0", width: 128, height: 128, borderRadius: 10, backgroundImage: "repeating-linear-gradient(45deg, #ded5ef 0 6px, #f4f0fc 6px 12px)", border: "1px solid rgba(36,31,61,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: "#6b6396", background: "#ffffff", padding: "4px 7px", borderRadius: 5 }}>QRコード</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6e6693", marginTop: 12, lineHeight: 1.7 }}>カメラで読み取るだけ<br />所要時間 約30秒</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(36,31,61,0.1)" }}>
                    <span style={{ width: 17, height: 17, borderRadius: 5, background: "#6852c1", color: "#ffffff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#8b7f63", letterSpacing: "0.06em" }}>太鼓判くん</span>
                  </div>
                </div>
              </div>
            </div>

            <Feature n="02" title="口コミの下書きはその都度、表現が変わる" body="決め手やおすすめメニューの選び方に応じて、毎回違う言い回しで下書きが組み立てられます。書き直しも自由です。">
              <div style={{ marginTop: 18, padding: "14px 15px", borderRadius: 14, background: "#f8f6fd", border: "1px solid rgba(104,82,193,0.18)", fontSize: 12.5, color: "#4b4272", lineHeight: 1.8 }}>「雰囲気」×「おすすめメニュー」→ 毎回ちがう一文が完成</div>
            </Feature>
            <Feature n="03" title="感想は、お店にもしっかり届く" body="もう少し詳しくお伝えしたい感想は、公開の口コミとは別に、メールでお店に直接届きます。次の接客にすぐ活かせます。">
              <div style={{ marginTop: 18, padding: "14px 15px", borderRadius: 14, background: "#fdf8ec", border: "1px solid rgba(184,135,58,0.28)", fontSize: 12.5, color: "#7a5a24", lineHeight: 1.8 }}>店長のメールに届く → 翌日の朝礼で共有</div>
            </Feature>
            <Feature n="04" title="店舗ごとに専用ページ" body="店名や口コミURL、質問項目、特典メッセージまで、お店ごとに1つずつ専用のページを作成します。">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 18 }}>
                {["店名", "口コミURL", "質問項目", "特典メッセージ"].map((t) => (
                  <span key={t} style={{ fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 999, background: "#f1edfb", color: "#52409c" }}>{t}</span>
                ))}
              </div>
            </Feature>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(52px, 7vw, 80px) 0", background: "#fdf8ec" }}>
        <div data-anim="" style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, margin: "0 auto", borderRadius: 999, border: "2px solid #b8873a", color: "#b8873a", fontSize: 22, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>判</div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", color: "#b8873a", marginTop: 16 }}>名前の由来</div>
          <blockquote style={{ margin: "14px 0 0", fontSize: "clamp(19px, 2.6vw, 24px)", fontWeight: 700, lineHeight: 1.75 }}>「太鼓判を押す」— たしかだと、保証する。</blockquote>
          <p style={{ marginTop: 16, fontSize: 14.5, color: "#6e6693", lineHeight: 1.95 }}>かつて、丈夫な太鼓の皮のような模様を刻んだ印を押すことが、本物である証とされたことに由来する言葉です。太鼓判くんは、来店されたお客様の“満足”というたしかな証を、Googleの口コミという形にしてお届けするお手伝いをします。</p>
        </div>
      </section>

      <section id="contact" style={{ ...section, background: "linear-gradient(158deg, #6852c1, #8474cd)", color: "#ffffff", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.3vw, 31px)", fontWeight: 900, lineHeight: 1.55 }}>導入について、まずは気軽にご相談ください。</h2>
          <p style={{ color: "rgba(255,255,255,0.86)", marginTop: 14, fontSize: 15 }}>店舗の業種や規模を問わず、1店舗からご案内しています。まずはお気軽にメールでお問い合わせください。</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
            <a href={CONTACT_HREF} className="h-hero-white" style={{ fontWeight: 700, fontSize: 15, borderRadius: 999, padding: "16px 30px", background: "#ffffff", color: "#6852c1", boxShadow: "0 24px 46px -22px rgba(36,31,61,0.7)" }}>メールで相談する</a>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 18 }}>Instagramのダイレクトメッセージでご連絡いただいた場合も、そちらで対応いたします。</p>
        </div>
      </section>

      <footer style={{ padding: "30px 24px", textAlign: "center", fontSize: 12, color: "#6e6693", borderTop: "1px solid rgba(36,31,61,0.1)" }}>
        © 太鼓判くん<span style={{ margin: "0 10px", opacity: 0.5 }}>・</span><Link href="/login" style={{ color: "#6e6693" }}>店舗ログイン</Link>
      </footer>
    </div>
  );
}

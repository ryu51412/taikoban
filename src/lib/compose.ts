// 口コミ文の下書きを組み立てる（デザイン見本 Review Page のテンプレートを移植）
// 書き出し + 決め手の文 + メニューの文 + 締め をランダムに組み合わせる

export const ASPECT_TEMPLATES: Record<string, string[]> = {
  旨味: ["旨味がしっかりしていて、箸が止まりませんでした。", "素材の旨味が濃く、想像以上の美味しさでした。", "噛むほどに旨味が広がって感動しました。"],
  ビール: ["キンキンに冷えたビールとの相性が抜群でした。", "ビールがすすむ味付けで、つい何杯もいただきました。", "ビールと一緒にいただくと最高でした。"],
  店員: ["店員さんの対応が気持ちよく、居心地の良い時間でした。", "スタッフの方が親切で、安心して過ごせました。", "店員さんのおすすめが的確で助かりました。"],
  料理: ["料理がとても美味しく、大満足でした。", "一品一品丁寧に作られているのが伝わりました。"],
  接客: ["接客が丁寧で、また来たいと思いました。", "細やかな心配りが感じられる接客でした。"],
  雰囲気: ["お店の雰囲気がとても良く、リラックスして過ごせました。", "落ち着いた空間で、ゆっくり食事を楽しめました。"],
};
export const GENERIC = ["{aspect}がとても良く、大満足でした。", "{aspect}に大変満足しました。", "{aspect}の良さが特に記憶に残りました。"];
export const OPENERS = ["{store}に伺いました。", "{store}を利用しました。", "先日、{store}でお食事しました。", "{store}へ行ってきました。"];
export const CLOSERS = ["また利用したいと思います。", "機会があればまた行きたいと思います。", "リピートしたいお店です。", "友人にもおすすめしたいです。"];
export const MENUS = ["{menu}が特においしかったです。", "{menu}は特におすすめです。", "特に{menu}が印象に残りました。", "{menu}をぜひ食べてみてほしいです。"];

// ★3以下のときは、評価と食い違わない控えめな言い回しにする（お客様が自由に直せる下書き）
const MID_BODY = ["{aspect}が良かったです。", "{aspect}は良いと感じました。"];
const MID_MENU = ["{menu}をいただきました。", "{menu}を注文しました。"];
const MID_CLOSERS = ["気になる点もありましたが、今後に期待しています。", "全体としてはまずまずでした。"];
const LOW_CLOSERS = ["正直なところ、今回は期待していたほどではありませんでした。", "いくつか気になる点がありました。改善に期待しています。"];

const pick = <T,>(a: T[], rnd: () => number = Math.random): T => a[Math.floor(rnd() * a.length)];

export function composeDraft(opts: {
  store: string;
  aspect: string;
  menu: string | null;
  rating: number;
  rnd?: () => number;
}): string {
  const { store, aspect, menu, rating } = opts;
  const rnd = opts.rnd ?? Math.random;
  const opener = pick(OPENERS, rnd).replace("{store}", store);

  if (rating >= 4) {
    const body = ASPECT_TEMPLATES[aspect] ? pick(ASPECT_TEMPLATES[aspect], rnd) : pick(GENERIC, rnd).replace("{aspect}", aspect);
    const menuPart = menu ? pick(MENUS, rnd).replace("{menu}", menu) + " " : "";
    return opener + body + " " + menuPart + pick(CLOSERS, rnd);
  }

  const body = pick(MID_BODY, rnd).replace("{aspect}", aspect);
  const menuPart = menu ? pick(MID_MENU, rnd).replace("{menu}", menu) + " " : "";
  return opener + body + " " + menuPart + pick(rating === 3 ? MID_CLOSERS : LOW_CLOSERS, rnd);
}

export const ISSUE_TAGS = ["待ち時間", "料理の味", "接客", "店内の清潔さ", "価格"];

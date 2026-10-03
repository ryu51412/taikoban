# 太鼓判くん（Google口コミ支援サービス）

店舗のレジ横にQRコードを置き、お客様が ★評価 →「決め手」→「おすすめメニュー」を選ぶだけで口コミの**下書き**ができ、そのままGoogleの投稿画面へ進めるサービスです。店舗オーナーは管理画面で集計・届いたご意見・QR／卓上POPを管理し、運営は全店舗の発行と成績を管理します。

デザインの見本（Claude Design からの資料）は [`docs/design/`](docs/design/) にあります。

## 画面

| パス | 画面 | ログイン |
|---|---|---|
| `/` | ホームページ（サービス紹介） | 不要 |
| `/r/[slug]` | 口コミページ（QRの読み取り先・お客様用） | 不要 |
| `/login` | ログイン | 不要 |
| `/owner` ・ `/owner/feedback` ・ `/owner/settings` | 店舗管理（集計／届いたご意見／店舗設定・QR） | オーナー |
| `/admin` ・ `/admin/new` ・ `/admin/stores/[id]` ・ `/admin/analytics` | 運営コンソール（店舗一覧／新規発行／店舗設定・QR／集計） | 運営 |
| `/pop/[id]` | 卓上POPの印刷用ページ（A6・ブラウザの「PDFに保存」でPDF化） | オーナー／運営 |

## 規約まわりの対応（デザインからの変更点）

デザインの README にある指示どおり、次のように実装しています（最終的な法的判断は専門家にご確認ください）。

1. **レビューゲーティングなし**：どの★でも「コピーしてGoogleに投稿」まで進めます。★3以下のときは下書き画面に「お店に直接伝える」を**追加**で表示し、ご意見フォームへ進めます（置き換えではありません）。
2. **見返りなし**：特典は「ご回答ありがとうございます。特典」として回答した全員に表示し、Googleに投稿したかどうかとは切り離しています。
3. **下書きの明示**：自動生成した文章は「下書き」と表示し、自由に編集できます。★3以下では評価と食い違わない控えめな言い回しにしています。
4. 運営の新規発行画面にあった「★のしきい値」は削除しました。

そのほかの小さな変更：集計は「今月」ではなく**直近30日（前の30日と比較）**にしています（月初に数字が小さくなりすぎるため）。運営の店舗設定に「公開状態」「プラン」、両方の設定に「ご意見の通知先メール」を追加しました。ホームページのフッターに「店舗ログイン」へのリンクを置いています。

## 動かし方

```bash
npm install
npm run dev   # http://localhost:3000
```

Supabase の環境変数が無いときは **デモモード** で動きます（サンプルの10店舗・メモリ上のデータ。再起動で元に戻ります）。

- オーナー：`owner@example.com` / `password123`（ホルモン丑之助）
- 運営：`operator@example.com` / `password123`
- お客様画面の例：`/r/ushinosuke`

## 本番の構成（Supabase + Vercel + Resend）

1. Supabase でプロジェクトを作り、SQL Editor で [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) を実行します（stores / profiles / events / responses・RLS・集計関数）。
2. `.env.example` を参考に環境変数を設定します（Vercel の Project Settings → Environment Variables）。
3. ログイン用ユーザーを Supabase の Authentication → Users で作成し、権限を登録します。

```sql
-- 運営アカウント
insert into profiles (id, role) values ('<auth.users の id>', 'operator');
-- 店舗オーナー（店舗は運営コンソールの「新規ページ発行」で作成）
insert into profiles (id, role, store_id) values ('<auth.users の id>', 'owner', '<stores の id>');
```

### 仕組みのメモ

- お客様画面からの記録（`/api/track`・`/api/feedback`）は匿名で受け付け、slug → 店舗の解決・入力チェック・簡易レート制限をサーバー側で行います。DB へはサーバーだけが service role キーで書き込みます（RLS は二重の守り）。
- 集計はすべて `events` から計算します。Supabase では SQL 関数 `tk_store_stats`、デモモードでは `src/lib/stats.ts` の `computeStats` が同じ定義で計算するので、★分布の合計とファネルの「★をタップした」が必ず一致します。
- ログインは Supabase Auth（メール＋パスワード）。トークンは HTTP-only Cookie に保存し、「ログインを保持する」がオンなら30日、オフならブラウザを閉じるまでです。
- ご意見フォームの回答は、店舗設定で通知がオンなら Resend で通知先メールに送ります。
- レート制限はサーバーのプロセス内メモリです。複数台で動かす場合は Upstash などに置き換えてください。

## 開発

```bash
npm run lint
npx tsc --noEmit
npm run build
```

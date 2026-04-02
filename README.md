# CariNodeX - 就活企業発見アプリ

AIがあなたの興味に合った企業をレコメンドする、理系修士学生向けの就活支援Webアプリです。

**https://carinodex-xi.vercel.app**

## 主な機能

- **企業検索** - 8カテゴリ80以上のキーワードと企業規模から、Gemini AIが最適な企業を10社レコメンド
- **企業詳細** - 技術スタック、採用情報、待遇、選考対策ヒントをAIが動的に生成
- **マイリスト** - 気になる企業を登録して選考ステータス（未応募〜内定）を一元管理
- **プロフィール** - ガクチカ・スキル・資格を登録してES添削に活用
- **ES添削** - 登録したガクチカを特定企業向けにAIが添削、Before/After比較で改善点を可視化

## スクリーンショット

| 企業検索 | 企業詳細 | マイリスト |
|---|---|---|
| キーワードをカテゴリ別に選択 | AIが生成する詳細情報 | ステータス管理・フィルター |

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| AI | Gemini API (`gemini-2.0-flash`) |
| データ永続化 | localStorage |
| デプロイ | Vercel |

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local に GEMINI_API_KEY を設定

# 開発サーバー起動
npm run dev
```

http://localhost:3000 でアプリが起動します。

## 環境変数

| 変数名 | 説明 |
|---|---|
| `GEMINI_API_KEY` | Google Gemini APIキー（サーバーサイドのみで使用） |

## ディレクトリ構成

```
src/
├── app/           # ページ・APIルート
│   ├── api/       # Route Handlers (search, company, review)
│   ├── company/   # 企業詳細ページ
│   ├── discover/  # 企業検索ページ
│   ├── profile/   # プロフィールページ
│   └── review/    # ES添削ページ
├── components/    # UIコンポーネント
│   └── ui/        # 共通UIコンポーネント (Button, Card, Badge, etc.)
├── lib/           # ユーティリティ
│   ├── gemini.ts  # Gemini API呼び出し
│   ├── prompts.ts # プロンプトテンプレート
│   └── storage.ts # localStorage管理
└── types/         # TypeScript型定義
```

## デザイン

- 白基調のクリーンなUI
- Noto Sans JP + Geist フォント
- モバイルファースト・レスポンシブ対応（SP: ボトムナビ / PC: トップナビ）
- ページ遷移アニメーション・ホバーエフェクト

## ライセンス

MIT

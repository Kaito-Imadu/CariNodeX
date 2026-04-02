# CariNodeX - 開発ガイド

## プロジェクト概要

28卒理系修士学生向けの就活支援Webアプリ。Gemini APIを使って企業レコメンドとES添削を行う。

## コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run lint` - ESLint実行
- `npm start` - プロダクションサーバー起動

## アーキテクチャ

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS 4（ダークモード、Glassmorphismベース）
- **AI**: Gemini API (`gemini-2.5-flash`) を Route Handler (`/api/*`) 経由で呼び出し。APIキーはサーバーサイドのみ
- **データ永続化**: localStorage（`lib/storage.ts` で一元管理、バージョン番号付き）
- **プロンプト管理**: `lib/prompts.ts` に全プロンプトテンプレートを集約

## 主要ファイル

- `src/types/index.ts` - 全型定義
- `src/lib/gemini.ts` - Gemini API呼び出し＋JSONパース
- `src/lib/prompts.ts` - 検索・企業詳細・ES添削のプロンプトテンプレート
- `src/lib/storage.ts` - localStorage CRUD操作（企業、プロフィール、添削履歴、検索キャッシュ）
- `src/components/ui/` - 共通UIコンポーネント（Button, Card, Badge, Input, Tag, Skeleton, Modal, ProgressBar）

## コーディング規約

- コンポーネントは `"use client"` ディレクティブ付きのClient Component主体
- API通信は Route Handler 経由（`/api/search`, `/api/company/[id]`, `/api/review`）
- `useSearchParams` を使うページは `Suspense` でラップ必須
- カラーはTailwind CSS テーマ変数を使用（`primary`, `surface`, `muted` 等）
- アニメーションクラス: `animate-fade-in`, `animate-slide-up`, `animate-shimmer`, `glass`

## 環境変数

- `GEMINI_API_KEY` - Gemini APIキー（`.env.local` に設定、サーバーサイドのみ）

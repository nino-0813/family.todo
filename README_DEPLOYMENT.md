# 家族用TODOアプリダッシュボード - デプロイメントガイド

## Vercel Postgres データベースのセットアップ

### 1. Vercel Postgres データベースの作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトページで「Storage」タブをクリック
3. 「Create Database」→「Postgres」を選択
4. データベース名を入力（例：`family-todo-db`）
5. リージョンを選択（例：`Tokyo`）
6. 「Create」をクリック

### 2. 環境変数の設定

Vercel Dashboard の「Settings」→「Environment Variables」で以下を設定：

```
POSTGRES_URL=postgres://username:password@host:port/database
POSTGRES_PRISMA_URL=postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://username:password@host:port/database
POSTGRES_USER=username
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database
```

### 3. デプロイメント

1. GitHubにリポジトリをプッシュ
2. Vercel Dashboard で「New Project」をクリック
3. GitHubリポジトリを選択
4. フレームワークプリセットで「Vite」を選択
5. 「Deploy」をクリック

### 4. データベースの初期化

デプロイ後、初回アクセス時に自動的にデータベースが初期化されます。

## ローカル開発環境でのテスト

### 1. 必要なパッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Vercel Postgres の接続情報を設定：

```env
POSTGRES_URL=your_postgres_url_here
POSTGRES_PRISMA_URL=your_postgres_prisma_url_here
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling_here
POSTGRES_USER=your_username
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

## データベーススキーマ

### family_members テーブル
- `id`: VARCHAR(50) PRIMARY KEY
- `name`: VARCHAR(100) NOT NULL
- `color`: VARCHAR(7) NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE

### todos テーブル
- `id`: VARCHAR(50) PRIMARY KEY
- `title`: VARCHAR(500) NOT NULL
- `completed`: BOOLEAN DEFAULT FALSE
- `assigned_to`: VARCHAR(100) NOT NULL
- `assigned_to_color`: VARCHAR(7) NOT NULL
- `due_date`: DATE
- `priority`: VARCHAR(20) DEFAULT 'normal'
- `category`: VARCHAR(100)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

## API エンドポイント

### TODO関連
- `GET /api/todos` - すべてのTODOを取得
- `POST /api/todos` - 新しいTODOを作成
- `PUT /api/todos` - TODOを更新
- `DELETE /api/todos?id={id}` - TODOを削除

### 家族メンバー関連
- `GET /api/family-members` - 家族メンバー一覧を取得
- `POST /api/family-members` - 新しい家族メンバーを追加
- `PUT /api/family-members` - 家族メンバー情報を更新
- `DELETE /api/family-members?id={id}` - 家族メンバーを削除

## トラブルシューティング

### データベース接続エラー
- Vercel Dashboard で環境変数が正しく設定されているか確認
- データベースの状態が「Ready」になっているか確認

### API エラー
- ブラウザの開発者ツールでネットワークタブを確認
- Vercel Dashboard の「Functions」タブでエラーログを確認

### 初期データが表示されない
- データベースの初期化が完了しているか確認
- API エンドポイントに直接アクセスしてレスポンスを確認

import { sql } from '@vercel/postgres';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  assigned_to: string;
  assigned_to_color: string;
  priority: 'high' | 'normal';
  due_date?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

// データベースの初期化
export async function initializeDatabase() {
  try {
    // family_membersテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS family_members (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // todosテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(50) PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        assigned_to VARCHAR(100) NOT NULL,
        assigned_to_color VARCHAR(7) NOT NULL,
        priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
        due_date DATE,
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // updated_atを自動更新するトリガー関数の作成
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // todosテーブルのupdated_atトリガー
    await sql`
      DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
      CREATE TRIGGER update_todos_updated_at
        BEFORE UPDATE ON todos
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    // デフォルトの家族メンバーを挿入（存在しない場合のみ）
    await sql`
      INSERT INTO family_members (id, name, color)
      VALUES 
        ('dad', 'パパ', '#3b82f6'),
        ('mom', 'ママ', '#ec4899'),
        ('son', '息子', '#10b981'),
        ('daughter', '娘', '#f59e0b')
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

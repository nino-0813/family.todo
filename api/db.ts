import { sql } from '@vercel/postgres';

// データベースの初期化
export async function initializeDatabase() {
  try {
    // family_members テーブルを作成
    await sql`
      CREATE TABLE IF NOT EXISTS family_members (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // todos テーブルを作成
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        assigned_to VARCHAR(100) NOT NULL,
        assigned_to_color VARCHAR(7) NOT NULL,
        due_date DATE,
        priority VARCHAR(20) DEFAULT 'normal',
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // 初期データを挿入（family_members）
    const existingMembers = await sql`SELECT COUNT(*) FROM family_members`;
    if (existingMembers.rows[0].count === '0') {
      await sql`
        INSERT INTO family_members (id, name, color) VALUES
        ('dad', 'パパ', '#3b82f6'),
        ('mom', 'ママ', '#ec4899'),
        ('son', '息子', '#10b981'),
        ('daughter', '娘', '#f59e0b')
      `;
    }

    // 初期データを挿入（todos）
    const existingTodos = await sql`SELECT COUNT(*) FROM todos`;
    if (existingTodos.rows[0].count === '0') {
      await sql`
        INSERT INTO todos (id, title, completed, assigned_to, assigned_to_color, due_date, priority) VALUES
        ('1', '夕食の買い物', FALSE, 'ママ', '#ec4899', '2025-10-16', 'high'),
        ('2', '宿題を終わらせる', FALSE, '息子', '#10b981', '2025-10-17', 'normal'),
        ('3', 'ゴミ出し', TRUE, 'パパ', '#3b82f6', '2025-10-16', 'normal'),
        ('4', 'ピアノの練習', FALSE, '娘', '#f59e0b', NULL, 'normal'),
        ('5', '洗濯物を畳む', FALSE, 'ママ', '#ec4899', '2025-10-16', 'normal')
      `;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Todo型の定義
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  assignedToColor: string;
  dueDate?: string;
  priority?: 'high' | 'normal';
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// FamilyMember型の定義
export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
}

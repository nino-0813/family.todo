import { sql } from '@vercel/postgres';
import { Todo, FamilyMember, initializeDatabase } from './db';

class PostgresClient {
  constructor() {
    // データベースを初期化
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  // 全タスクを取得
  async getTodos(): Promise<{ todos: Todo[] }> {
    try {
      const { rows } = await sql`
        SELECT 
          id,
          title,
          completed,
          assigned_to,
          assigned_to_color,
          priority,
          due_date,
          category,
          created_at,
          updated_at
        FROM todos
        ORDER BY created_at DESC
      `;

      return { todos: rows as Todo[] };
    } catch (error) {
      console.error('Failed to get todos:', error);
      throw error;
    }
  }

  // タスクを作成
  async createTodo(todoData: {
    title: string;
    assignedTo: string;
    assignedToColor: string;
    priority?: 'high' | 'normal';
    dueDate?: string;
    category?: string;
  }): Promise<{ todo: Todo }> {
    try {
      const id = Date.now().toString();
      const { rows } = await sql`
        INSERT INTO todos (
          id, title, assigned_to, assigned_to_color, 
          priority, due_date, category
        )
        VALUES (
          ${id}, ${todoData.title}, ${todoData.assignedTo}, 
          ${todoData.assignedToColor}, ${todoData.priority || 'normal'}, 
          ${todoData.dueDate || null}, ${todoData.category || null}
        )
        RETURNING *
      `;

      return { todo: rows[0] as Todo };
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  }

  // タスクを更新
  async updateTodo(id: string, updates: {
    completed?: boolean;
    priority?: 'high' | 'normal';
  }): Promise<{ todo: Todo }> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.completed !== undefined) {
        updateFields.push(`completed = $${values.length + 1}`);
        values.push(updates.completed);
      }

      if (updates.priority !== undefined) {
        updateFields.push(`priority = $${values.length + 1}`);
        values.push(updates.priority);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE todos 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length + 1}
        RETURNING *
      `;

      values.push(id);

      const { rows } = await sql.query(query, values);

      if (rows.length === 0) {
        throw new Error(`Todo with id ${id} not found`);
      }

      return { todo: rows[0] as Todo };
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    }
  }

  // タスクを削除
  async deleteTodo(id: string): Promise<{ success: boolean }> {
    try {
      const { rowCount } = await sql`
        DELETE FROM todos WHERE id = ${id}
      `;

      if (rowCount === 0) {
        throw new Error(`Todo with id ${id} not found`);
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    }
  }

  // 家族メンバーを取得
  async getFamilyMembers(): Promise<{ familyMembers: FamilyMember[] }> {
    try {
      const { rows } = await sql`
        SELECT id, name, color, created_at
        FROM family_members
        ORDER BY created_at ASC
      `;

      return { familyMembers: rows as FamilyMember[] };
    } catch (error) {
      console.error('Failed to get family members:', error);
      throw error;
    }
  }

  // 家族メンバーを作成
  async createFamilyMember(memberData: {
    id: string;
    name: string;
    color: string;
  }): Promise<{ familyMember: FamilyMember }> {
    try {
      const { rows } = await sql`
        INSERT INTO family_members (id, name, color)
        VALUES (${memberData.id}, ${memberData.name}, ${memberData.color})
        RETURNING *
      `;

      return { familyMember: rows[0] as FamilyMember };
    } catch (error) {
      console.error('Failed to create family member:', error);
      throw error;
    }
  }
}

export const postgresClient = new PostgresClient();

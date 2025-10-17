import { put, del, list } from '@vercel/blob';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  assignedToColor: string;
  priority: 'high' | 'normal';
  dueDate?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

export interface AppData {
  todos: Todo[];
  familyMembers: FamilyMember[];
  lastUpdated: string;
}

class BlobStoreClient {
  private readonly BLOB_STORE_URL = 'https://api.vercel.com/v1/blob';
  private readonly TODOS_KEY = 'family-todos.json';
  private readonly FAMILY_MEMBERS_KEY = 'family-members.json';

  // データを取得
  async getAppData(): Promise<AppData> {
    try {
      // 両方のファイルを並行して取得
      const [todosBlob, familyMembersBlob] = await Promise.all([
        this.getBlob(this.TODOS_KEY),
        this.getBlob(this.FAMILY_MEMBERS_KEY)
      ]);

      return {
        todos: todosBlob ? JSON.parse(todosBlob) : [],
        familyMembers: familyMembersBlob ? JSON.parse(familyMembersBlob) : [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get app data:', error);
      // フォールバック: 空のデータを返す
      return {
        todos: [],
        familyMembers: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // データを保存
  async saveAppData(data: AppData): Promise<void> {
    try {
      // 両方のファイルを並行して保存
      await Promise.all([
        this.putBlob(this.TODOS_KEY, JSON.stringify(data.todos, null, 2)),
        this.putBlob(this.FAMILY_MEMBERS_KEY, JSON.stringify(data.familyMembers, null, 2))
      ]);
    } catch (error) {
      console.error('Failed to save app data:', error);
      throw error;
    }
  }

  // タスクを保存
  async saveTodos(todos: Todo[]): Promise<void> {
    try {
      await this.putBlob(this.TODOS_KEY, JSON.stringify(todos, null, 2));
    } catch (error) {
      console.error('Failed to save todos:', error);
      throw error;
    }
  }

  // 家族メンバーを保存
  async saveFamilyMembers(familyMembers: FamilyMember[]): Promise<void> {
    try {
      await this.putBlob(this.FAMILY_MEMBERS_KEY, JSON.stringify(familyMembers, null, 2));
    } catch (error) {
      console.error('Failed to save family members:', error);
      throw error;
    }
  }

  // Blobからデータを取得
  private async getBlob(key: string): Promise<string | null> {
    try {
      // まずリストで存在確認
      const blobs = await list({ prefix: key });
      const blob = blobs.blobs.find(b => b.pathname === key);
      
      if (!blob) {
        return null;
      }

      // データを取得
      const response = await fetch(blob.url);
      if (!response.ok) {
        return null;
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Failed to get blob ${key}:`, error);
      return null;
    }
  }

  // Blobにデータを保存
  private async putBlob(key: string, data: string): Promise<void> {
    try {
      await put(key, data, { access: 'public' });
    } catch (error) {
      console.error(`Failed to put blob ${key}:`, error);
      throw error;
    }
  }

  // データを削除（必要に応じて）
  async deleteData(): Promise<void> {
    try {
      await Promise.all([
        del(this.TODOS_KEY),
        del(this.FAMILY_MEMBERS_KEY)
      ]);
    } catch (error) {
      console.error('Failed to delete data:', error);
      throw error;
    }
  }
}

export const blobClient = new BlobStoreClient();

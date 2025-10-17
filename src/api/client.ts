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

class ApiClient {
  private baseUrl: string;

  constructor() {
    // 開発環境では相対パス、本番環境では絶対URL
    this.baseUrl = import.meta.env.DEV ? '' : 'https://family-todo.vercel.app';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // 全タスクを取得
  async getTodos(): Promise<{ todos: Todo[] }> {
    return this.request<{ todos: Todo[] }>('/todos');
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
    return this.request<{ todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify(todoData),
    });
  }

  // タスクを更新
  async updateTodo(id: string, updates: {
    completed?: boolean;
    priority?: 'high' | 'normal';
  }): Promise<{ todo: Todo }> {
    return this.request<{ todo: Todo }>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // タスクを削除
  async deleteTodo(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // 家族メンバーを取得
  async getFamilyMembers(): Promise<{ familyMembers: FamilyMember[] }> {
    return this.request<{ familyMembers: FamilyMember[] }>('/family-members');
  }

  // 家族メンバーを作成
  async createFamilyMember(memberData: {
    id: string;
    name: string;
    color: string;
  }): Promise<{ familyMember: FamilyMember }> {
    return this.request<{ familyMember: FamilyMember }>('/family-members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }
}

export const apiClient = new ApiClient();

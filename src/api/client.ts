import { Todo } from '../components/TodoItem.tsx';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
}

// API Base URL
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api'  // ブラウザ環境では相対パスを使用
  : 'http://localhost:3000/api';  // SSR環境用

// API クライアントクラス
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // エラーハンドリング
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // TODO関連のAPI
  async getTodos(): Promise<{ todos: Todo[] }> {
    const response = await fetch(`${this.baseUrl}/todos`);
    return this.handleResponse<{ todos: Todo[] }>(response);
  }

  async createTodo(todoData: {
    title: string;
    assignedTo: string;
    assignedToColor: string;
    priority?: 'high' | 'normal';
    dueDate?: string;
    category?: string;
  }): Promise<{ todo: Todo }> {
    const response = await fetch(`${this.baseUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });
    return this.handleResponse<{ todo: Todo }>(response);
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<{ todo: Todo }> {
    const response = await fetch(`${this.baseUrl}/todos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    return this.handleResponse<{ todo: Todo }>(response);
  }

  async deleteTodo(id: string): Promise<{ message: string; deletedTodo: Todo }> {
    const response = await fetch(`${this.baseUrl}/todos?id=${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ message: string; deletedTodo: Todo }>(response);
  }

  // 家族メンバー関連のAPI
  async getFamilyMembers(): Promise<{ familyMembers: FamilyMember[] }> {
    const response = await fetch(`${this.baseUrl}/family-members`);
    return this.handleResponse<{ familyMembers: FamilyMember[] }>(response);
  }

  async createFamilyMember(memberData: {
    id: string;
    name: string;
    color: string;
  }): Promise<{ familyMember: FamilyMember }> {
    const response = await fetch(`${this.baseUrl}/family-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    return this.handleResponse<{ familyMember: FamilyMember }>(response);
  }

  async updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<{ familyMember: FamilyMember }> {
    const response = await fetch(`${this.baseUrl}/family-members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    return this.handleResponse<{ familyMember: FamilyMember }>(response);
  }

  async deleteFamilyMember(id: string): Promise<{ message: string; deletedMember: FamilyMember }> {
    const response = await fetch(`${this.baseUrl}/family-members?id=${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ message: string; deletedMember: FamilyMember }>(response);
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();

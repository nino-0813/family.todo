import React, { useState, useEffect } from "react";
import { Todo } from "./components/TodoItem";
import { SwipeableTask } from "./components/SwipeableTask";
import { QuickAddTask } from "./components/QuickAddTask";
import { ProgressHeader } from "./components/ProgressHeader";
import { EmptyState } from "./components/EmptyState";
import { TaskGroup } from "./components/TaskGroup";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CheckCircle2, Circle, Users, Flame, Calendar, Clock, Inbox } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { FamilyMember, apiClient } from "./api/client";
import { PWAInstallButton } from "./components/PWAInstallButton";

// デフォルトの家族メンバー（APIから取得できない場合のフォールバック）
const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  { id: "dad", name: "パパ", color: "#3b82f6" },
  { id: "mom", name: "ママ", color: "#ec4899" },
  { id: "son", name: "息子", color: "#10b981" },
  { id: "daughter", name: "娘", color: "#f59e0b" },
];

const INITIAL_TODOS: Todo[] = [
  {
    id: "1",
    title: "夕食の買い物",
    completed: false,
    assignedTo: "ママ",
    assignedToColor: "#ec4899",
    dueDate: "2025-10-16",
    priority: "high",
  },
  {
    id: "2",
    title: "宿題を終わらせる",
    completed: false,
    assignedTo: "息子",
    assignedToColor: "#10b981",
    dueDate: "2025-10-17",
    priority: "normal",
  },
  {
    id: "3",
    title: "ゴミ出し",
    completed: true,
    assignedTo: "パパ",
    assignedToColor: "#3b82f6",
    dueDate: "2025-10-16",
    priority: "normal",
  },
  {
    id: "4",
    title: "ピアノの練習",
    completed: false,
    assignedTo: "娘",
    assignedToColor: "#f59e0b",
    priority: "normal",
  },
  {
    id: "5",
    title: "洗濯物を畳む",
    completed: false,
    assignedTo: "ママ",
    assignedToColor: "#ec4899",
    dueDate: "2025-10-16",
    priority: "normal",
  },
];

// LocalStorage helper functions
const STORAGE_KEY = "family-todo-app";

const loadTodos = (): Todo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_TODOS;
  } catch {
    return INITIAL_TODOS;
  }
};

const saveTodos = (todos: Todo[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error("Failed to save todos:", error);
  }
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [familyMembers, setFamilyMembers] = useState(DEFAULT_FAMILY_MEMBERS);
  const [filter, setFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // データを読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // APIからデータを取得
        console.log('Loading data from API...');
        const [todosResponse, familyMembersResponse] = await Promise.all([
          apiClient.getTodos(),
          apiClient.getFamilyMembers()
        ]);
        
        setTodos(todosResponse.todos);
        setFamilyMembers(familyMembersResponse.familyMembers);
      } catch (err) {
        console.error('Failed to load data from API:', err);
        // フォールバック: LocalStorageを使用
        console.log('Falling back to LocalStorage...');
        const storedTodos = loadTodos();
        setTodos(storedTodos);
        setFamilyMembers(DEFAULT_FAMILY_MEMBERS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTodo = async (
    title: string,
    assignedTo: string,
    assignedToColor: string,
    priority: 'high' | 'normal' = 'normal',
    dueDate?: string,
    category?: string
  ) => {
    try {
      // APIに保存
      const response = await apiClient.createTodo({
        title,
        assignedTo,
        assignedToColor,
        priority,
        dueDate,
        category,
      });
      
      const updatedTodos = [response.todo, ...todos];
      setTodos(updatedTodos);
      
      // LocalStorageにもバックアップ保存
      saveTodos(updatedTodos);
      
      toast.success("タスクを追加しました", {
        description: title,
      });
    } catch (err) {
      console.error('Failed to create todo:', err);
      toast.error("タスクの追加に失敗しました", {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      // APIに保存
      const response = await apiClient.updateTodo(id, {
        completed: !todo.completed,
      });
      
      setTodos(todos.map(t =>
        t.id === id ? response.todo : t
      ));
      
      // LocalStorageにもバックアップ保存
      saveTodos(todos.map(t =>
        t.id === id ? response.todo : t
      ));
      
      if (!todo.completed) {
        toast.success("タスクを完了しました！🎉", {
          description: todo.title,
        });
      }
    } catch (err) {
      console.error('Failed to update todo:', err);
      toast.error("タスクの更新に失敗しました", {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    
    try {
      // APIから削除
      await apiClient.deleteTodo(id);
      
      const updatedTodos = todos.filter(t => t.id !== id);
      setTodos(updatedTodos);
      
      // LocalStorageにもバックアップ保存
      saveTodos(updatedTodos);
      
      toast.info("タスクを削除しました", {
        description: todo?.title,
      });
    } catch (err) {
      console.error('Failed to delete todo:', err);
      toast.error("タスクの削除に失敗しました", {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handlePriorityToggle = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const newPriority = todo.priority === 'high' ? 'normal' : 'high';
      
      // APIに保存
      const response = await apiClient.updateTodo(id, {
        priority: newPriority,
      });
      
      setTodos(todos.map(t =>
        t.id === id ? response.todo : t
      ));
      
      // LocalStorageにもバックアップ保存
      saveTodos(todos.map(t =>
        t.id === id ? response.todo : t
      ));
    } catch (err) {
      console.error('Failed to update todo priority:', err);
      toast.error("優先度の更新に失敗しました", {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Filter logic
  const filteredTodos = todos
    .filter(todo => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .filter(todo => {
      if (selectedMember === "all") return true;
      return todo.assignedTo === selectedMember;
    });

  // Group todos by date
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const overdueTodos = filteredTodos.filter(
    t => !t.completed && t.dueDate && t.dueDate < today
  );
  const todayTodos = filteredTodos.filter(
    t => !t.completed && t.dueDate === today
  );
  const tomorrowTodos = filteredTodos.filter(
    t => !t.completed && t.dueDate === tomorrow
  );
  const upcomingTodos = filteredTodos.filter(
    t => !t.completed && t.dueDate && t.dueDate > tomorrow
  );
  const noDueDateTodos = filteredTodos.filter(
    t => !t.completed && !t.dueDate
  );
  const completedTodos = filteredTodos.filter(t => t.completed);

  // Stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const todayTasksCount = todos.filter(t => t.dueDate === today).length;

  // ローディング状態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Toaster richColors position="top-center" />
      
      {/* Progress Header */}
      <ProgressHeader
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        todayTasks={todayTasksCount}
      />

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        {/* Member Filter */}
        <div className="px-4 pt-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMember("all")}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                selectedMember === "all"
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              <Users className="h-4 w-4" />
              すべて
            </motion.button>
            {familyMembers.map((member) => {
              const memberTodosCount = todos.filter(
                t => !t.completed && t.assignedTo === member.name
              ).length;
              
              return (
                <motion.button
                  key={member.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMember(member.name)}
                  className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                    selectedMember === member.name
                      ? 'border-gray-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: selectedMember === member.name ? `${member.color}15` : undefined,
                    borderColor: selectedMember === member.name ? member.color : undefined,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  {member.name}
                  {memberTodosCount > 0 && (
                    <span className="ml-1 text-sm">({memberTodosCount})</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div className="px-4 pb-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                すべて
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                未完了
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                完了
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task Lists */}
      <div className="p-4">
        {filteredTodos.length === 0 ? (
          <EmptyState filter={filter} hasAnyTodos={todos.length > 0} />
        ) : filter === "completed" ? (
          <TaskGroup
            title="完了したタスク"
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            todos={completedTodos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onPriorityToggle={handlePriorityToggle}
          />
        ) : (
          <>
            {overdueTodos.length > 0 && (
              <TaskGroup
                title="期限切れ"
                icon={<Flame className="h-5 w-5 text-red-500" />}
                todos={overdueTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onPriorityToggle={handlePriorityToggle}
              />
            )}
            
            {todayTodos.length > 0 && (
              <TaskGroup
                title="今日"
                icon={<Calendar className="h-5 w-5 text-blue-500" />}
                todos={todayTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onPriorityToggle={handlePriorityToggle}
              />
            )}
            
            {tomorrowTodos.length > 0 && (
              <TaskGroup
                title="明日"
                icon={<Clock className="h-5 w-5 text-orange-500" />}
                todos={tomorrowTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onPriorityToggle={handlePriorityToggle}
              />
            )}
            
            {upcomingTodos.length > 0 && (
              <TaskGroup
                title="今後"
                icon={<Calendar className="h-5 w-5 text-purple-500" />}
                todos={upcomingTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onPriorityToggle={handlePriorityToggle}
              />
            )}
            
            {noDueDateTodos.length > 0 && (
              <TaskGroup
                title="期限なし"
                icon={<Inbox className="h-5 w-5 text-gray-400" />}
                todos={noDueDateTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onPriorityToggle={handlePriorityToggle}
              />
            )}
          </>
        )}
      </div>

      {/* Quick Add Task */}
      <QuickAddTask
        familyMembers={familyMembers}
        onAddTodo={handleAddTodo}
      />

      {/* PWA Install Button */}
      <PWAInstallButton />
    </div>
  );
}

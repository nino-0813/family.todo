import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trash2 } from "lucide-react";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  assignedTo: string;
  assignedToColor: string;
  dueDate?: string;
  priority?: 'high' | 'normal';
  category?: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 active:bg-gray-50 transition-colors">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="h-5 w-5"
      />
      
      <div className="flex-1 min-w-0">
        <div className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {todo.title}
        </div>
        {todo.dueDate && (
          <div className="text-gray-500 text-sm mt-1">
            {todo.dueDate}
          </div>
        )}
      </div>
      
      <Avatar className="h-8 w-8" style={{ backgroundColor: todo.assignedToColor }}>
        <AvatarFallback className="text-white text-sm">
          {todo.assignedTo}
        </AvatarFallback>
      </Avatar>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(todo.id)}
        className="h-8 w-8 text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trash2, Flag, Sparkles } from "lucide-react";
import { Todo } from "./TodoItem";

interface SwipeableTaskProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityToggle: (id: string) => void;
}

export function SwipeableTask({ todo, onToggle, onDelete, onPriorityToggle }: SwipeableTaskProps) {
  const x = useMotionValue(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const constraintsRef = useRef(null);

  const backgroundColor = useTransform(
    x,
    [-150, -75, 0, 75, 150],
    ["#ef4444", "#f97316", "#ffffff", "#10b981", "#10b981"]
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x < -threshold) {
      setIsDeleting(true);
      setTimeout(() => onDelete(todo.id), 300);
    } else if (info.offset.x > threshold) {
      onToggle(todo.id);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
  const isToday = todo.dueDate === new Date().toISOString().split('T')[0];

  return (
    <div className="relative overflow-hidden rounded-xl" ref={constraintsRef}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-red-500">
          <Trash2 className="h-5 w-5" />
          <span>削除</span>
        </div>
        <div className="flex items-center gap-2 text-green-500">
          <Sparkles className="h-5 w-5" />
          <span>完了</span>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        style={{ x, backgroundColor }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={isDeleting ? { opacity: 0, height: 0, marginBottom: 0 } : {}}
        transition={{ duration: 0.3 }}
        className={`relative flex items-center gap-3 p-4 rounded-xl border cursor-grab active:cursor-grabbing ${
          todo.completed 
            ? 'border-gray-200 bg-gray-50' 
            : isOverdue 
            ? 'border-red-200 bg-red-50/50'
            : isToday
            ? 'border-blue-200 bg-blue-50/50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="h-5 w-5 shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <motion.div 
              className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
              animate={todo.completed ? { scale: [1, 1.02, 1] } : {}}
            >
              {todo.title}
            </motion.div>
            {todo.priority === 'high' && !todo.completed && (
              <Flag className="h-4 w-4 text-red-500 shrink-0" fill="currentColor" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            {todo.dueDate && (
              <div className={`text-sm ${
                isOverdue && !todo.completed
                  ? 'text-red-600'
                  : todo.completed
                  ? 'text-gray-400'
                  : isToday
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {isOverdue && !todo.completed && '⚠️ '}
                {todo.dueDate === new Date().toISOString().split('T')[0] ? '今日' : todo.dueDate}
              </div>
            )}
            {todo.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                todo.completed ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700'
              }`}>
                {todo.category}
              </span>
            )}
          </div>
        </div>
        
        <Avatar 
          className="h-8 w-8 shrink-0 cursor-pointer active:scale-95 transition-transform" 
          style={{ backgroundColor: todo.assignedToColor }}
          onClick={(e) => {
            e.stopPropagation();
            onPriorityToggle(todo.id);
          }}
        >
          <AvatarFallback className="text-white text-sm">
            {todo.assignedTo}
          </AvatarFallback>
        </Avatar>
      </motion.div>
    </div>
  );
}

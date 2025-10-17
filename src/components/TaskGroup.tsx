import { motion } from "motion/react";
import { SwipeableTask } from "./SwipeableTask";
import { Todo } from "./TodoItem";

interface TaskGroupProps {
  title: string;
  icon?: React.ReactNode;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityToggle: (id: string) => void;
}

export function TaskGroup({ title, icon, todos, onToggle, onDelete, onPriorityToggle }: TaskGroupProps) {
  if (todos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon}
        <h3 className="text-gray-700">{title}</h3>
        <span className="text-gray-400 text-sm">({todos.length})</span>
      </div>
      <div className="space-y-2">
        {todos.map((todo, index) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SwipeableTask
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onPriorityToggle={onPriorityToggle}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

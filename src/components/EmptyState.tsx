import { motion } from "motion/react";
import { CheckCircle2, ListTodo, Calendar } from "lucide-react";

interface EmptyStateProps {
  filter: "all" | "active" | "completed";
  hasAnyTodos: boolean;
}

export function EmptyState({ filter, hasAnyTodos }: EmptyStateProps) {
  if (!hasAnyTodos) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="inline-block mb-4"
        >
          <ListTodo className="h-16 w-16 text-gray-300" />
        </motion.div>
        <h3 className="text-gray-900 mb-2">タスクがありません</h3>
        <p className="text-gray-500 text-sm">
          下のボタンから最初のタスクを追加しましょう
        </p>
      </motion.div>
    );
  }

  if (filter === "completed") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-6"
      >
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">完了したタスクはありません</h3>
        <p className="text-gray-500 text-sm">
          タスクを完了すると、ここに表示されます
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-6"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 0.5,
        }}
      >
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      <h3 className="text-gray-900 mb-2">すべて完了しました！🎉</h3>
      <p className="text-gray-500 text-sm">
        素晴らしい！すべてのタスクが完了しました
      </p>
    </motion.div>
  );
}

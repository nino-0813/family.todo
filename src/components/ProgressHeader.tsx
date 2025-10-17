import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface ProgressHeaderProps {
  totalTasks: number;
  completedTasks: number;
  todayTasks: number;
}

export function ProgressHeader({ totalTasks, completedTasks, todayTasks }: ProgressHeaderProps) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const activeTasks = totalTasks - completedTasks;

  return (
    <div className="bg-white/10 backdrop-blur-xl text-gray-600 p-6 rounded-b-3xl shadow-xl border-b border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="mb-1 text-gray-700">家族のタスク</h1>
          <p className="text-gray-500 text-sm">
            {activeTasks === 0 ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                すべて完了しました！🎉
              </span>
            ) : (
              `${activeTasks}件のタスクが残っています`
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl text-gray-700">{Math.round(progress)}%</div>
          <div className="text-gray-500 text-sm">完了率</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-xl text-gray-700">{totalTasks}</div>
          <div className="text-gray-500 text-xs">総タスク</div>
        </div>
        <div className="text-center">
          <div className="text-xl text-green-600">{completedTasks}</div>
          <div className="text-gray-500 text-xs">完了</div>
        </div>
        <div className="text-center">
          <div className="text-xl text-blue-600">{todayTasks}</div>
          <div className="text-gray-500 text-xs">今日</div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, X, Flag, Calendar as CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface QuickAddTaskProps {
  familyMembers: FamilyMember[];
  onAddTodo: (
    title: string,
    assignedTo: string,
    assignedToColor: string,
    priority?: 'high' | 'normal',
    dueDate?: string,
    category?: string
  ) => void;
}

export function QuickAddTask({ familyMembers, onAddTodo }: QuickAddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]);
  const [priority, setPriority] = useState<'high' | 'normal'>('normal');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(
        title,
        selectedMember.name,
        selectedMember.color,
        priority,
        date ? format(date, 'yyyy-MM-dd') : undefined,
        undefined
      );
      setTitle("");
      setPriority('normal');
      setDate(undefined);
      setIsExpanded(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <motion.div
      layout
      className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg"
    >
      <AnimatePresence>
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-xl active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5" />
            新しいタスクを追加
          </motion.button>
        ) : (
          <motion.form
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスク名を入力..."
                autoFocus
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle("");
                  setDueDate("");
                  setShowDatePicker(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {familyMembers.map((member) => (
                <motion.button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member)}
                  whileTap={{ scale: 0.95 }}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    selectedMember.id === member.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300'
                  }`}
                >
                  <Avatar className="h-5 w-5" style={{ backgroundColor: member.color }}>
                    <AvatarFallback className="text-white text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </motion.button>
              ))}

              <motion.button
                type="button"
                onClick={() => setPriority(priority === 'high' ? 'normal' : 'high')}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                  priority === 'high'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                <Flag className="h-3.5 w-3.5" fill={priority === 'high' ? 'currentColor' : 'none'} />
                <span className="text-sm">重要</span>
              </motion.button>

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                      date
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="text-sm">
                      {date ? format(date, 'M月d日', { locale: ja }) : '期限'}
                    </span>
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDate(today);
                        setIsCalendarOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      📅 今日
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDate(tomorrow);
                        setIsCalendarOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      ⏰ 明日
                    </Button>
                    {date && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDate(undefined);
                          setIsCalendarOpen(false);
                        }}
                        className="w-full justify-start text-red-600 hover:text-red-700"
                      >
                        ✕ クリア
                      </Button>
                    )}
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setIsCalendarOpen(false);
                    }}
                    locale={ja}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={!title.trim()}
              className="w-full"
            >
              追加
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

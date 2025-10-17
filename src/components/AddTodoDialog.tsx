import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

interface AddTodoDialogProps {
  familyMembers: FamilyMember[];
  onAddTodo: (title: string, assignedTo: string, assignedToColor: string, dueDate?: string) => void;
}

export function AddTodoDialog({ familyMembers, onAddTodo }: AddTodoDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]?.id || "");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const member = familyMembers.find(m => m.id === selectedMember);
      onAddTodo(
        title,
        member?.name || "",
        member?.color || "#6366f1",
        dueDate || undefined
      );
      setTitle("");
      setDueDate("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle>新しいタスク</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">タスク名</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：買い物に行く"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="member">担当者</Label>
            <div className="grid grid-cols-2 gap-2">
              {familyMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMember(member.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedMember === member.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span>{member.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dueDate">期限（任意）</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button type="submit" className="flex-1">
              追加
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

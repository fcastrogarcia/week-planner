"use client";

import { Task, TaskCategory, TaskPriority } from "@/types";

interface BacklogTaskCardProps {
  task: Task;
  onUpdate: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onSchedule: (task: Task) => void;
}

const BacklogTaskCard = ({ task, onUpdate, onEdit, onSchedule }: BacklogTaskCardProps) => {
  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return { text: "Alta", color: "text-red-600 bg-red-50 border-red-200" };
      case TaskPriority.MEDIUM:
        return { text: "Media", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
      case TaskPriority.LOW:
        return { text: "Baja", color: "text-green-600 bg-green-50 border-green-200" };
      case TaskPriority.URGENT:
        return { text: "Urgente", color: "text-red-700 bg-red-100 border-red-300" };
      default:
        return { text: "Media", color: "text-gray-600 bg-gray-50 border-gray-200" };
    }
  };

  const getCategoryText = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.WORK:
        return "Trabajo";
      case TaskCategory.PERSONAL:
        return "Personal";
      case TaskCategory.HEALTH:
        return "Salud";
      case TaskCategory.EDUCATION:
        return "Educación";
      case TaskCategory.SOCIAL:
        return "Social";
      case TaskCategory.OTHER:
        return "Otros";
      default:
        return category;
    }
  };

  const handleToggleComplete = () => {
    onUpdate(task.id);
  };

  const priorityInfo = getPriorityText(task.priority);

  return (
    <div className="border-b border-gray-200 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <label className="cursor-pointer">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                task.completed
                  ? "bg-slate-500 border-slate-500"
                  : "bg-white border-gray-300 hover:border-slate-400"
              }`}
            >
              {task.completed && (
                <svg
                  className="w-2.5 h-2.5 text-white absolute"
                  style={{ marginTop: "1px", marginLeft: "1px" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </label>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm font-medium truncate cursor-pointer ${
                task.completed ? "line-through text-gray-400" : "text-gray-700"
              }`}
              onClick={handleToggleComplete}
            >
              {task.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityInfo.color}`}
          >
            {priorityInfo.text}
          </span>

          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full border">
            {getCategoryText(task.category)}
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => onEdit(task)}
              className="px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
            >
              Editar
            </button>

            <button
              onClick={() => onSchedule(task)}
              className="px-2 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
            >
              Agendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogTaskCard;

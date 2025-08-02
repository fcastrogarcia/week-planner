"use client";

import React, { useState } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { getDueDateInfo, DueDateStatus } from "@/utils/dateUtils";
import {
  BriefcaseIcon,
  HomeIcon,
  HeartIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PencilIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface BacklogTaskCardProps {
  task: Task;
  onUpdate: () => void;
  onSchedule: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const BacklogTaskCard: React.FC<BacklogTaskCardProps> = ({
  task,
  onUpdate,
  onSchedule,
  onEdit,
}) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const getPriorityChipColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500 text-white";
      case TaskPriority.HIGH:
        return "bg-orange-500 text-white";
      case TaskPriority.MEDIUM:
        return "bg-yellow-500 text-white";
      case TaskPriority.LOW:
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryTags = (category: TaskCategory) => {
    const tags: { label: string; color: string; icon: React.ReactElement }[] = [];
    const iconClass = "h-3 w-3";

    switch (category) {
      case TaskCategory.WORK:
        tags.push({
          label: "Trabajo",
          color: "bg-blue-100 text-blue-800",
          icon: <BriefcaseIcon className={iconClass} />,
        });
        break;
      case TaskCategory.PERSONAL:
        tags.push({
          label: "Personal",
          color: "bg-purple-100 text-purple-800",
          icon: <HomeIcon className={iconClass} />,
        });
        break;
      case TaskCategory.HEALTH:
        tags.push({
          label: "Salud",
          color: "bg-green-100 text-green-800",
          icon: <HeartIcon className={iconClass} />,
        });
        break;
      case TaskCategory.EDUCATION:
        tags.push({
          label: "Educación",
          color: "bg-yellow-100 text-yellow-800",
          icon: <BookOpenIcon className={iconClass} />,
        });
        break;
      case TaskCategory.SOCIAL:
        tags.push({
          label: "Social",
          color: "bg-pink-100 text-pink-800",
          icon: <UserGroupIcon className={iconClass} />,
        });
        break;
      case TaskCategory.OTHER:
        tags.push({
          label: "Otro",
          color: "bg-gray-100 text-gray-800",
          icon: <DocumentTextIcon className={iconClass} />,
        });
        break;
    }

    return tags;
  };

  const handleToggleComplete = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      localStorageService.updateTask(task.id, { completed: !task.completed });
      onUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleSchedule = () => {
    onSchedule(task);
  };

  const dueDateInfo = getDueDateInfo(task);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`font-medium text-gray-900 ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityChipColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className={`text-sm text-gray-600 mb-2 ${task.completed ? "line-through" : ""}`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1 mb-2">
            {getCategoryTags(task.category).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${tag.color}`}
              >
                {tag.icon}
                {tag.label}
              </span>
            ))}
          </div>

          {dueDateInfo.status !== DueDateStatus.NO_DUE_DATE && (
            <div className="flex items-center gap-1 mb-2">
              <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
              <span
                className={`text-xs ${
                  dueDateInfo.status === DueDateStatus.OVERDUE
                    ? "text-red-600 font-medium"
                    : dueDateInfo.status === DueDateStatus.DUE_SOON
                    ? "text-orange-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {dueDateInfo.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Editar tarea"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            disabled={isCompleting}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {!task.completed && (
          <button
            onClick={handleSchedule}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Programar
          </button>
        )}
      </div>
    </div>
  );
};

export default BacklogTaskCard;

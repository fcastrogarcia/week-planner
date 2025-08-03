"use client";

import React, { useState } from "react";
import { Task, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { ClockIcon } from "@heroicons/react/24/outline";
import { getDueDateInfo, DueDateStatus } from "@/utils/dateUtils";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onEdit?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onEdit }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const getPriorityChipColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return "bg-red-500";
      case TaskPriority.HIGH:
        return "bg-orange-500";
      case TaskPriority.MEDIUM:
        return "bg-yellow-500";
      case TaskPriority.LOW:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompleting(true);
    try {
      if (task.completed) {
        localStorageService.markTaskIncomplete(task.id);
      } else {
        localStorageService.markTaskCompleted(task.id);
      }
      onUpdate();
    } catch (error) {
      console.error("Error toggling task completion:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dueDateInfo = getDueDateInfo(task);

  return (
    <div
      className="border border-gray-300 bg-white rounded-md p-2 text-xs transition-all hover:shadow-md hover:bg-gray-50 cursor-pointer"
      onClick={handleCardClick}
    >
      {task.startTime && (
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3 text-gray-600" />
            <span className="font-normal text-gray-700 text-xs">{formatTime(task.startTime)}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${getPriorityChipColor(task.priority)}`}
            title={`Prioridad: ${task.priority}`}
          />
        </div>
      )}

      {/* Layout compacto horizontal */}
      <div className="flex items-center gap-2">
        {/* Checkbox mejorado */}
        <button
          onClick={handleToggleComplete}
          disabled={isCompleting}
          className={`w-4 h-4 rounded-md border-2 transition-all flex-shrink-0 flex items-center justify-center ${
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400 hover:bg-green-50"
          }`}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-light text-xs leading-tight truncate ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.title}
          </h4>

          {/* Indicador de vencimiento */}
          {dueDateInfo.status !== DueDateStatus.NO_DUE_DATE && (
            <div
              className={`text-xs mt-1 px-1.5 py-0.5 rounded-full inline-flex items-center ${dueDateInfo.bgColor} ${dueDateInfo.color}`}
            >
              <span className="font-medium truncate text-xs">{dueDateInfo.message}</span>
            </div>
          )}
        </div>

        {!task.startTime && (
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityChipColor(task.priority)}`}
            title={`Prioridad: ${task.priority}`}
          />
        )}
      </div>
    </div>
  );
};

export default TaskCard;

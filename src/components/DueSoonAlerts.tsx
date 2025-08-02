"use client";

import React from "react";
import { Task } from "@/types";
import { getDueDateInfo, DueDateStatus } from "@/utils/dateUtils";
import { ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";

interface DueSoonAlertsProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const DueSoonAlerts: React.FC<DueSoonAlertsProps> = ({ tasks, onTaskClick }) => {
  // Filtrar tareas que están vencidas o próximas a vencer
  const urgentTasks = tasks
    .filter((task) => !task.completed && task.dueDate)
    .map((task) => ({ task, dueDateInfo: getDueDateInfo(task) }))
    .filter(
      ({ dueDateInfo }) =>
        dueDateInfo.status === DueDateStatus.OVERDUE ||
        dueDateInfo.status === DueDateStatus.DUE_SOON
    )
    .sort((a, b) => a.dueDateInfo.daysUntilDue - b.dueDateInfo.daysUntilDue);

  if (urgentTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-center mb-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
        <h3 className="text-sm font-semibold text-orange-800">
          Tareas próximas a vencer ({urgentTasks.length})
        </h3>
      </div>

      <div className="space-y-2">
        {urgentTasks.map(({ task, dueDateInfo }) => (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task)}
            className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-2"
            style={{
              borderLeftColor: dueDateInfo.status === DueDateStatus.OVERDUE ? "#dc2626" : "#ea580c",
            }}
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${dueDateInfo.bgColor} ${dueDateInfo.color}`}
                >
                  <span>{dueDateInfo.icon}</span>
                  <span>{dueDateInfo.message}</span>
                </div>
                {task.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {task.category}
                  </span>
                )}
              </div>
            </div>

            <div className="ml-4 flex items-center text-gray-400">
              <ClockIcon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DueSoonAlerts;

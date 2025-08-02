"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import BacklogTaskCard from "@/components/BacklogTaskCard";
import EditBacklogTaskModal from "@/components/EditBacklogTaskModal";

interface BacklogState {
  backlogTasks: Task[];
  filters: {
    searchTerm: string;
    selectedCategory: TaskCategory | "ALL";
    selectedPriority: TaskPriority | "ALL";
    showCompleted: boolean;
    sortBy: "priority" | "category" | "created";
    viewMode: "grid" | "list";
  };
  schedule: {
    isModalOpen: boolean;
    task: Task | null;
    date: string;
    startTime: string;
    endTime: string;
  };
  edit: {
    isModalOpen: boolean;
    task: Task | null;
  };
}

interface BacklogListProps {
  onRefresh: () => void;
  onEditTask?: (task: Task) => void;
}

const BacklogList: React.FC<BacklogListProps> = ({ onRefresh, onEditTask }) => {
  const [state, setState] = useState<BacklogState>({
    backlogTasks: [],
    filters: {
      searchTerm: "",
      selectedCategory: "ALL",
      selectedPriority: "ALL",
      showCompleted: false,
      sortBy: "priority",
      viewMode: "grid",
    },
    schedule: {
      isModalOpen: false,
      task: null,
      date: "",
      startTime: "",
      endTime: "",
    },
    edit: {
      isModalOpen: false,
      task: null,
    },
  });

  const loadBacklogTasks = () => {
    const tasks = localStorageService.getBacklogTasks();
    setState((prev) => ({ ...prev, backlogTasks: tasks }));
  };

  useEffect(() => {
    loadBacklogTasks();
  }, []);

  const filteredAndSortedTasks = state.backlogTasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase().includes(state.filters.searchTerm.toLowerCase()) ?? false);
      const matchesCategory =
        state.filters.selectedCategory === "ALL" ||
        task.category === state.filters.selectedCategory;
      const matchesPriority =
        state.filters.selectedPriority === "ALL" ||
        task.priority === state.filters.selectedPriority;
      const matchesCompleted = state.filters.showCompleted || !task.completed;
      return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
    })
    .sort((a, b) => {
      if (state.filters.sortBy === "priority") {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (state.filters.sortBy === "category") {
        return a.category.localeCompare(b.category);
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleTaskUpdate = () => {
    loadBacklogTasks();
    onRefresh();
  };

  const handleEditTask = (task: Task) => {
    setState((prev) => ({
      ...prev,
      edit: {
        isModalOpen: true,
        task,
      },
    }));
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleSaveTask = (updatedTask: Partial<Task>) => {
    if (!state.edit.task) return;
    localStorageService.updateTask(state.edit.task.id, updatedTask);
    handleTaskUpdate();
    setState((prev) => ({
      ...prev,
      edit: {
        isModalOpen: false,
        task: null,
      },
    }));
  };

  const handleDeleteTask = () => {
    if (!state.edit.task) return;
    localStorageService.deleteTask(state.edit.task.id);
    handleTaskUpdate();
    setState((prev) => ({
      ...prev,
      edit: {
        isModalOpen: false,
        task: null,
      },
    }));
  };

  const handleScheduleTask = (task: Task) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(10, 0, 0, 0);

    setState((prev) => ({
      ...prev,
      schedule: {
        isModalOpen: true,
        task,
        date: todayStr,
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
      },
    }));
  };

  const handleConfirmSchedule = () => {
    if (
      !state.schedule.task ||
      !state.schedule.date ||
      !state.schedule.startTime ||
      !state.schedule.endTime
    )
      return;

    const [year, month, day] = state.schedule.date.split("-").map(Number);
    const [startHours, startMinutes] = state.schedule.startTime.split(":").map(Number);
    const [endHours, endMinutes] = state.schedule.endTime.split(":").map(Number);

    const startTime = new Date(year, month - 1, day, startHours, startMinutes);
    const endTime = new Date(year, month - 1, day, endHours, endMinutes);

    localStorageService.updateTask(state.schedule.task.id, {
      startTime,
      isBacklog: false,
      updatedAt: new Date(),
    });

    localStorageService.createEvent({
      title: state.schedule.task.title,
      description: state.schedule.task.description,
      startTime,
      endTime,
      location: "",
      userId: "local-user",
    });

    handleTaskUpdate();
    setState((prev) => ({
      ...prev,
      schedule: {
        isModalOpen: false,
        task: null,
        date: "",
        startTime: "",
        endTime: "",
      },
    }));
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Lista de Tareas Pendientes</h3>
          <span className="text-sm text-gray-500">{filteredAndSortedTasks.length} tareas</span>
        </div>

        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No hay tareas pendientes</p>
            <p className="text-xs mt-1">Las tareas sin fecha aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredAndSortedTasks.map((task) => (
              <BacklogTaskCard
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onSchedule={handleScheduleTask}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para programar tarea */}
      {state.schedule.isModalOpen && state.schedule.task && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setState((prev) => ({
                ...prev,
                schedule: {
                  isModalOpen: false,
                  task: null,
                  date: "",
                  startTime: "",
                  endTime: "",
                },
              }));
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Programar: {state.schedule.task.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={state.schedule.date}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      schedule: { ...prev.schedule, date: e.target.value },
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={state.schedule.startTime}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, startTime: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={state.schedule.endTime}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        schedule: { ...prev.schedule, endTime: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    schedule: {
                      isModalOpen: false,
                      task: null,
                      date: "",
                      startTime: "",
                      endTime: "",
                    },
                  }))
                }
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Programar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {state.edit.isModalOpen && state.edit.task && (
        <EditBacklogTaskModal
          task={state.edit.task}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() =>
            setState((prev) => ({
              ...prev,
              edit: {
                isModalOpen: false,
                task: null,
              },
            }))
          }
        />
      )}
    </>
  );
};

export default BacklogList;

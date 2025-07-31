"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { getDueDateInfo, DueDateStatus } from "@/utils/dueDateUtils";
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
          color: "bg-green-100 text-green-800",
          icon: <HomeIcon className={iconClass} />,
        });
        break;
      case TaskCategory.HEALTH:
        tags.push({
          label: "Salud",
          color: "bg-pink-100 text-pink-800",
          icon: <HeartIcon className={iconClass} />,
        });
        break;
      case TaskCategory.EDUCATION:
        tags.push({
          label: "Educación",
          color: "bg-purple-100 text-purple-800",
          icon: <BookOpenIcon className={iconClass} />,
        });
        break;
      case TaskCategory.SOCIAL:
        tags.push({
          label: "Social",
          color: "bg-yellow-100 text-yellow-800",
          icon: <UserGroupIcon className={iconClass} />,
        });
        break;
      default:
        tags.push({
          label: "Otro",
          color: "bg-gray-100 text-gray-800",
          icon: <DocumentTextIcon className={iconClass} />,
        });
    }
    return tags;
  };

  const handleToggleComplete = async () => {
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

  const dueDateInfo = getDueDateInfo(task);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1">
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

          {/* Título */}
          <h4
            className={`font-medium text-sm truncate flex-1 ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.title}
          </h4>

          {/* Indicador de vencimiento */}
          {dueDateInfo.status !== DueDateStatus.NO_DUE_DATE && (
            <div
              className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${dueDateInfo.bgColor} ${dueDateInfo.color}`}
            >
              {dueDateInfo.message}
            </div>
          )}

          {/* Etiquetas de categoría */}
          <div className="flex gap-1 flex-shrink-0">
            {getCategoryTags(task.category).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${tag.color} flex items-center gap-1`}
              >
                {tag.icon}
                {tag.label}
              </span>
            ))}
          </div>

          {/* Chip de prioridad */}
          <span
            className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityChipColor(task.priority)}`}
            title={`Prioridad: ${task.priority}`}
          ></span>
        </div>

        {/* Acciones */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
            title="Editar tarea"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSchedule(task)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="Programar en calendario"
          >
            <CalendarDaysIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface BacklogListProps {
  onRefresh: () => void;
  onEditTask?: (task: Task) => void;
}

const BacklogList: React.FC<BacklogListProps> = ({ onRefresh, onEditTask }) => {
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState<Task | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadBacklogTasks = () => {
    const tasks = localStorageService.getBacklogTasks();
    setBacklogTasks(tasks);
  };

  useEffect(() => {
    loadBacklogTasks();
  }, []);

  const handleEditTask = (task: Task) => {
    if (onEditTask) {
      onEditTask(task);
    } else {
      setEditingTask(task);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveEdit = (updatedTask: Partial<Task>) => {
    if (!editingTask) return;

    localStorageService.updateTask(editingTask.id, updatedTask);
    loadBacklogTasks();
    onRefresh();
    handleCloseEditModal();
  };

  const handleScheduleTask = (task: Task) => {
    setTaskToSchedule(task);
    const today = new Date();
    setScheduleDate(today.toISOString().split("T")[0]);
    setScheduleStartTime("09:00");
    setScheduleEndTime("10:00");
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!taskToSchedule || !scheduleDate) return;

    const startDateTime = new Date(`${scheduleDate}T${scheduleStartTime}:00`);

    localStorageService.scheduleBacklogTask(taskToSchedule.id, startDateTime);

    setIsScheduleModalOpen(false);
    setTaskToSchedule(null);
    loadBacklogTasks();
    onRefresh();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Lista de Tareas Pendientes</h3>
          <span className="text-sm text-gray-500">{backlogTasks.length} tareas</span>
        </div>

        {backlogTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No hay tareas pendientes</p>
            <p className="text-xs mt-1">Las tareas sin fecha aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {backlogTasks.map((task) => (
              <BacklogTaskCard
                key={task.id}
                task={task}
                onUpdate={() => {
                  loadBacklogTasks();
                  onRefresh();
                }}
                onSchedule={handleScheduleTask}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para programar tarea */}
      {isScheduleModalOpen && taskToSchedule && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsScheduleModalOpen(false);
              setTaskToSchedule(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Programar: {taskToSchedule.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
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
                    value={scheduleStartTime}
                    onChange={(e) => setScheduleStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={scheduleEndTime}
                    onChange={(e) => setScheduleEndTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
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
      {isEditModalOpen && editingTask && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setEditingTask(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <EditTaskModal
              task={editingTask}
              onSave={handleSaveEdit}
              onDelete={() => {
                localStorageService.deleteTask(editingTask.id);
                loadBacklogTasks();
                onRefresh();
                handleCloseEditModal();
              }}
              onClose={handleCloseEditModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

// Componente de modal de edición
interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onDelete, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState(task.priority);
  const [completed, setCompleted] = useState(task.completed);

  const handleSave = () => {
    onSave({
      title,
      description: description || undefined,
      category,
      priority,
      completed,
      updatedAt: new Date(),
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Editar Tarea</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Título de la tarea"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Descripción opcional"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value={TaskCategory.WORK}>Trabajo</option>
              <option value={TaskCategory.PERSONAL}>Personal</option>
              <option value={TaskCategory.HEALTH}>Salud</option>
              <option value={TaskCategory.EDUCATION}>Educación</option>
              <option value={TaskCategory.SOCIAL}>Social</option>
              <option value={TaskCategory.OTHER}>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value={TaskPriority.LOW}>Baja</option>
              <option value={TaskPriority.MEDIUM}>Media</option>
              <option value={TaskPriority.HIGH}>Alta</option>
              <option value={TaskPriority.URGENT}>Urgente</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700">Marcar como completada</label>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Información adicional</h4>
          <p className="text-xs text-gray-600">
            <strong>Creado:</strong> {task.createdAt.toLocaleString("es-ES")}
          </p>
          <p className="text-xs text-gray-600">
            <strong>Actualizado:</strong> {task.updatedAt.toLocaleString("es-ES")}
          </p>
          <p className="text-xs text-gray-600">
            <strong>Estado:</strong> {task.isBacklog ? "Sin programar" : "Programado"}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
              onDelete();
              onClose();
            }
          }}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Cambios
        </button>
      </div>
    </>
  );
};

export default BacklogList;

"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { frequentTasksService } from "@/services/frequentTasks";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  startTime: string;
  dueDate: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  isBacklog: boolean;
  isFavorite: boolean;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onTaskUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    startTime: "",
    dueDate: "",
    category: TaskCategory.PERSONAL,
    priority: TaskPriority.MEDIUM,
    completed: false,
    isBacklog: false,
    isFavorite: false,
  });

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title,
        description: task.description || "",
        startTime: task.startTime ? formatDateTimeLocal(new Date(task.startTime)) : "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        category: task.category,
        priority: task.priority,
        completed: task.completed,
        isBacklog: task.isBacklog || false,
        isFavorite: task.isFavorite || false,
      });
    }
  }, [task, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFavoriteToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isFavorite: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const updateData: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        completed: formData.completed,
        isBacklog: formData.isBacklog,
        isFavorite: formData.isFavorite,
      };

      if (!formData.isBacklog) {
        if (formData.startTime) {
          updateData.startTime = new Date(formData.startTime);
        } else {
          updateData.startTime = undefined;
        }
      } else {
        // Si se cambia a backlog, limpiar las fechas
        updateData.startTime = undefined;
      }

      // Manejar fecha de vencimiento (disponible tanto para backlog como para tareas programadas)
      if (formData.dueDate) {
        const [year, month, day] = formData.dueDate.split("-").map(Number);
        updateData.dueDate = new Date(year, month - 1, day, 23, 59, 59); // Final del día
      } else {
        updateData.dueDate = undefined;
      }

      localStorageService.updateTask(task.id, updateData);

      // Manejar tareas frecuentes
      const frequentTasks = frequentTasksService.getFrequentTasks();
      const existingFrequentTask = frequentTasks.find(
        (fTask) => fTask.title.toLowerCase() === formData.title.trim().toLowerCase()
      );

      if (formData.isFavorite) {
        // Agregar o incrementar tarea frecuente
        if (existingFrequentTask) {
          frequentTasksService.useFrequentTask(existingFrequentTask.id);
        } else {
          frequentTasksService.addFrequentTask({
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            priority: formData.priority,
          });
        }
      } else {
        // Remover de tareas frecuentes si existe
        if (existingFrequentTask) {
          frequentTasksService.deleteFrequentTask(existingFrequentTask.id);
        }
      }

      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      localStorageService.deleteTask(task.id);
      onTaskUpdated();
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Editar Tarea</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción opcional"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isBacklog"
                checked={formData.isBacklog}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Lista de pendientes (sin programar)</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={handleFavoriteToggle}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Tarea frecuente (aparecerá en sugerencias frecuentes)
              </label>
            </div>

            {!formData.isBacklog && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  step="900"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de vencimiento (opcional)
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se mostrará una advertencia 3 días antes del vencimiento
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={TaskPriority.LOW}>Baja</option>
                  <option value={TaskPriority.MEDIUM}>Media</option>
                  <option value={TaskPriority.HIGH}>Alta</option>
                  <option value={TaskPriority.URGENT}>Urgente</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Marcar como completada</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Eliminar
              </button>
              <div className="flex-1 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;

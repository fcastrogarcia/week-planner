"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { frequentTasksService, FrequentTask } from "@/services/frequentTasks";
import {
  ClockIcon,
  StarIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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

const CreateTaskPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frequentTasks, setFrequentTasks] = useState<FrequentTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Fecha mínima (hoy) para los inputs de fecha
  const today = new Date();
  const minDateTime = today.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM

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

  // Función para formatear fecha manteniendo zona horaria local
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Función para redondear minutos a intervalos de 15
  const roundToQuarterHour = (dateTimeString: string): string => {
    if (!dateTimeString) return dateTimeString;

    const date = new Date(dateTimeString);
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;

    if (roundedMinutes === 60) {
      date.setHours(date.getHours() + 1);
      date.setMinutes(0);
    } else {
      date.setMinutes(roundedMinutes);
    }

    return formatDateTimeLocal(date);
  };

  useEffect(() => {
    loadFrequentTasks();
    loadCategories();

    // Verificar si hay una fecha en los parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");

    if (dateParam) {
      // Parsear la fecha de forma local para evitar problemas de zona horaria
      const [year, month, day] = dateParam.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day); // month es 0-indexado

      if (!isNaN(selectedDate.getTime())) {
        // Configurar fecha de inicio a las 9:00 AM
        const startTime = new Date(year, month - 1, day, 9, 0);

        setFormData((prev) => ({
          ...prev,
          startTime: formatDateTimeLocal(startTime),
        }));
      }
    }
  }, []);

  useEffect(() => {
    filterFrequentTasks();
  }, [searchQuery, selectedCategory]);

  const loadFrequentTasks = () => {
    const tasks = frequentTasksService.getMostUsedTasks(12);
    setFrequentTasks(tasks);
  };

  const loadCategories = () => {
    const cats = frequentTasksService.getAllCategories();
    setCategories(cats);
  };

  const filterFrequentTasks = () => {
    let filtered: FrequentTask[] = [];

    if (searchQuery) {
      filtered = frequentTasksService.searchTasks(searchQuery);
    } else if (selectedCategory !== "all") {
      filtered = frequentTasksService.getTasksByCategory(selectedCategory);
    } else {
      filtered = frequentTasksService.getMostUsedTasks(12);
    }

    setFrequentTasks(filtered);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFrequentTaskSelect = (task: FrequentTask) => {
    setFormData((prev) => ({
      ...prev,
      title: task.title,
      description: task.description || "",
      category: task.category as TaskCategory,
      priority: task.priority as TaskPriority,
    }));
  };

  const handleFrequentTaskDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    frequentTasksService.deleteFrequentTask(taskId);
    loadFrequentTasks();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      if (formData.isBacklog) {
        localStorageService.createBacklogTask({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          completed: formData.completed,
          userId: "local-user",
          isFavorite: formData.isFavorite,
        });
      } else {
        // Crear tarea programada con fechas opcionales
        const taskData: any = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          completed: formData.completed,
          userId: "local-user",
          isFavorite: formData.isFavorite,
        };

        // Solo agregar fechas si están presentes
        if (formData.startTime) {
          // Crear fecha preservando la zona horaria local
          const [datePart, timePart] = formData.startTime.split("T");
          const [year, month, day] = datePart.split("-").map(Number);
          const [hours, minutes] = timePart.split(":").map(Number);
          taskData.startTime = new Date(year, month - 1, day, hours, minutes);
        }

        if (formData.dueDate) {
          // Para fecha de vencimiento, usar solo la fecha (sin hora)
          const [year, month, day] = formData.dueDate.split("-").map(Number);
          taskData.dueDate = new Date(year, month - 1, day, 23, 59, 59); // Final del día
        }

        localStorageService.createTask(taskData);
      }

      // Manejar tareas frecuentes
      if (formData.isFavorite) {
        const existingFrequentTask = frequentTasks.find(
          (task) => task.title.toLowerCase() === formData.title.trim().toLowerCase()
        );

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
      }

      // Obtener la fecha de la tarea para navegar al calendario correcto
      const redirectUrl = "/?refresh=true";

      router.push(redirectUrl);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      WORK: "Trabajo",
      PERSONAL: "Personal",
      HEALTH: "Salud",
      EDUCATION: "Educación",
      SOCIAL: "Social",
      OTHER: "Otro",
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Nueva Tarea</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Panel de Tareas Frecuentes */}
          <div className="bg-white rounded-lg shadow-sm flex flex-col">
            <div className="p-6 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-800">Tareas Frecuentes</h2>
              </div>

              {/* Búsqueda y filtros */}
              <div className="space-y-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryDisplayName(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de tareas frecuentes - ocupando todo el espacio restante */}
            <div className="flex-1 p-6 pt-0 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {frequentTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-500 text-center">
                      {searchQuery ? "No se encontraron tareas" : "No hay tareas frecuentes aún"}
                    </p>
                  </div>
                ) : (
                  frequentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="relative group p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-md transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleFrequentTaskSelect(task)}
                        className="w-full text-left"
                      >
                        <div className="font-medium text-gray-900 text-sm">{task.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getCategoryDisplayName(task.category)}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-600 mt-1 truncate">
                            {task.description}
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleFrequentTaskDelete(task.id, e)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600"
                        title="Eliminar tarea frecuente"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Texto informativo en la parte inferior */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span>Selecciona una tarea para rellenar automáticamente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg p-6 shadow-sm overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Título *</label>
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
                <label className="block text-sm font-medium text-gray-900 mb-1">Descripción</label>
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
                <label className="text-sm text-gray-900">
                  Agregar a lista de pendientes (sin programar)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isFavorite: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-900">
                  Marcar como tarea frecuente (se agregará a frecuentes)
                </label>
              </div>

              {!formData.isBacklog && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    min={minDateTime}
                    step="900"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Fecha de vencimiento (opcional)
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={today.toISOString().split("T")[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se mostrará una advertencia 3 días antes del vencimiento
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Categoría</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">Prioridad</label>
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
                <label className="text-sm text-gray-900">Marcar como completada</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Creando..." : "Crear Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;

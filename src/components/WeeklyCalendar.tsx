"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Task, Event, TaskCategory, TaskPriority } from "@/types";
import { localStorageService } from "@/services/localStorage";
import TaskCard from "./TaskCard";
import EventCard from "./EventCard";
import EditEventModal from "./EditEventModal";
import { PlusIcon } from "@heroicons/react/24/outline";

interface WeeklyCalendarProps {
  onRefresh?: () => void;
  onEditTask?: (task: Task) => void;
  refreshTrigger?: number;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  onRefresh,
  onEditTask,
  refreshTrigger,
}) => {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForDate, setCreateForDate] = useState<Date | null>(null);

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
    loadWeekData();
    if (onRefresh) onRefresh();
    handleCloseEditModal();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditEventModalOpen(true);
  };

  const handleCloseEditEventModal = () => {
    setIsEditEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdated = () => {
    loadWeekData();
    if (onRefresh) onRefresh();
  };

  const handleAddClick = (date: Date) => {
    const checkDate = new Date(date);
    const isPastDate = checkDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    if (isPastDate) return;

    setCreateForDate(date);
    setShowCreateModal(true);
  };
  const handleCreateTypeSelect = (type: "task" | "event") => {
    setShowCreateModal(false);

    if (createForDate) {
      const year = createForDate.getFullYear();
      const month = String(createForDate.getMonth() + 1).padStart(2, "0");
      const day = String(createForDate.getDate()).padStart(2, "0");
      const dateParam = `${year}-${month}-${day}`;

      if (type === "task") {
        router.push(`/create-task?date=${dateParam}`);
      } else {
        router.push(`/create-event?date=${dateParam}`);
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForDate(null);
  };

  const getStartOfWeek = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const result = new Date(d.setDate(diff));
    result.setHours(0, 0, 0, 0);
    return result;
  }, []);

  const getEndOfWeek = useCallback(
    (date: Date) => {
      const startOfWeek = getStartOfWeek(date);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return endOfWeek;
    },
    [getStartOfWeek]
  );

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const loadWeekData = useCallback(async () => {
    setLoading(true);
    try {
      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = getEndOfWeek(currentWeek);

      const tasksData = localStorageService.getTasksByDateRange(startOfWeek, endOfWeek);
      const eventsData = localStorageService.getEventsByDateRange(startOfWeek, endOfWeek);

      setTasks(tasksData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading week data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWeek, getStartOfWeek, getEndOfWeek]);

  useEffect(() => {
    loadWeekData();
  }, [loadWeekData]);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadWeekData();
    }
  }, [refreshTrigger, loadWeekData]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek.getTime());
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const getItemsForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = tasks.filter((task) => {
      if (!task.startTime) return false; // Filtrar tareas de backlog
      const taskDate = new Date(task.startTime);
      return taskDate >= dayStart && taskDate <= dayEnd;
    });

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });

    return { tasks: dayTasks, events: dayEvents };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const weekDays = getWeekDays(getStartOfWeek(currentWeek));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header con navegación */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigateWeek("prev")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Semana anterior
        </button>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Semana del {getStartOfWeek(currentWeek).toLocaleDateString("es-ES")}
          </h2>
          <button
            onClick={goToCurrentWeek}
            className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={() => navigateWeek("next")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Siguiente semana
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-2 lg:gap-3">
        {weekDays.map((day, index) => {
          const { tasks: dayTasks, events: dayEvents } = getItemsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isPastDate = new Date(day).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

          return (
            <div
              key={index}
              className={`border rounded-lg p-2 min-h-[300px] ${
                isToday ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
              }`}
            >
              {/* Header del día más compacto */}
              <div className="flex justify-between items-center mb-2">
                <div
                  className={`text-center flex-1 ${
                    isToday ? "text-blue-600 font-bold" : "text-gray-700"
                  }`}
                >
                  <div className="text-xs capitalize">{formatDate(day)}</div>
                </div>
                <button
                  onClick={() => handleAddClick(day)}
                  disabled={isPastDate}
                  className={`p-1 rounded-full transition-colors ${
                    isPastDate
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  title={
                    isPastDate
                      ? "No se pueden agregar tareas a fechas pasadas"
                      : "Agregar tarea o evento"
                  }
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Eventos y tareas del día */}
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => handleEditEvent(event)} />
                ))}

                {dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={loadWeekData}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>

              {/* Indicador si no hay elementos */}
              {dayTasks.length === 0 && dayEvents.length === 0 && (
                <div className="text-xs text-gray-400 text-center mt-4">Sin actividades</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de edición */}
      {isEditModalOpen && editingTask && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEditModal();
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <EditTaskModal
              task={editingTask}
              onSave={handleSaveEdit}
              onClose={handleCloseEditModal}
            />
          </div>
        </div>
      )}

      {/* Modal de edición de eventos */}
      {isEditEventModalOpen && editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={isEditEventModalOpen}
          onClose={handleCloseEditEventModal}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* Modal de selección de tipo para crear */}
      {showCreateModal && createForDate && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseCreateModal();
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              ¿Qué quieres agregar?
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Para el{" "}
              {createForDate.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleCreateTypeSelect("task")}
                className="w-full p-4 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-colors text-left"
              >
                <div className="font-medium text-gray-800">Nueva Tarea</div>
                <div className="text-sm text-gray-600">Crear una tarea con horario específico</div>
              </button>

              <button
                onClick={() => handleCreateTypeSelect("event")}
                className="w-full p-4 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors text-left"
              >
                <div className="font-medium text-gray-800">Nuevo Evento</div>
                <div className="text-sm text-gray-600">
                  Crear un evento con ubicación e invitados
                </div>
              </button>
            </div>

            <button
              onClick={handleCloseCreateModal}
              className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de modal de edición (copiado de BacklogList para reutilizar)
interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Partial<Task>) => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onClose }) => {
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

export default WeeklyCalendar;

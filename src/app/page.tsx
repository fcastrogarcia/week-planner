"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import EditTaskModal from "@/components/EditTaskModal";
import BacklogList from "@/components/BacklogList";
import DueSoonAlerts from "@/components/DueSoonAlerts";
import { Task } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { CalendarDaysIcon, PlusIcon, CheckIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  // Cargar todas las tareas para las alertas de vencimiento
  const loadTasks = () => {
    const tasks = localStorageService.getTasks();
    const backlogTasks = localStorageService.getBacklogTasks();
    setAllTasks([...tasks, ...backlogTasks]);
  };

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  // Escuchar cuando el usuario regresa de crear una tarea/evento
  useEffect(() => {
    // Verificar si hay parámetro refresh en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get("refresh");

    if (shouldRefresh) {
      // Remover los parámetros de la URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      // Forzar refresh
      handleTaskCreated();
    }

    const handleFocus = () => {
      // Recargar datos cuando la ventana regain focus
      handleTaskCreated();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Recargar datos cuando la página se vuelve visible
        handleTaskCreated();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleTaskCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEventCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
    setIsEditModalOpen(false);
  };

  const handleTaskUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-8 w-8 text-gray-900 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Planubi</h1>
              <span className="ml-3 text-sm text-gray-500">Tu planificador semanal</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/create-task")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Nueva Tarea
              </button>

              <button
                onClick={() => router.push("/create-event")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Nuevo Evento
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de tareas próximas a vencer */}
        <DueSoonAlerts tasks={allTasks} onTaskClick={handleEditTask} />

        <div className="space-y-8">
          {/* Calendario Semanal - Ancho completo */}
          <WeeklyCalendar
            onRefresh={handleTaskCreated}
            onEditTask={handleEditTask}
            refreshTrigger={refreshKey}
          />

          {/* Lista de Backlog - Debajo del calendario */}
          <BacklogList
            key={`backlog-${refreshKey}`}
            onRefresh={handleTaskCreated}
            onEditTask={handleEditTask}
          />
        </div>
      </main>

      {/* Modal para editar tarea */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}

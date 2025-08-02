"use client";

import React, { useState } from "react";
import { Task, TaskCategory, TaskPriority } from "@/types";

interface EditBacklogTaskModalProps {
  task: Task;
  onSave: (updatedTask: Partial<Task>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const EditBacklogTaskModal: React.FC<EditBacklogTaskModalProps> = ({
  task,
  onSave,
  onDelete,
  onClose,
}) => {
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

export default EditBacklogTaskModal;

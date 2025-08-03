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
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Editar Tarea</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <span className="text-xl leading-none">×</span>
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            rows={3}
            placeholder="Descripción opcional de la tarea"
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
              <option value="work">Trabajo</option>
              <option value="personal">Personal</option>
              <option value="health">Salud</option>
              <option value="education">Educación</option>
              <option value="social">Social</option>
              <option value="other">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-sm border transition-all duration-150 ${
                  completed
                    ? "bg-gray-800 border-gray-800"
                    : "bg-white border-gray-400 group-hover:border-gray-600"
                }`}
              >
                {completed && (
                  <div className="w-2 h-2 bg-white rounded-sm absolute top-1 left-1"></div>
                )}
              </div>
            </div>
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
              Tarea completada
            </span>
          </label>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Información de la tarea</h4>
          <p className="text-xs text-gray-600">
            <strong>Creada:</strong> {new Date(task.createdAt).toLocaleDateString("es-ES")}
          </p>
          {task.updatedAt && (
            <p className="text-xs text-gray-600">
              <strong>Última modificación:</strong>{" "}
              {new Date(task.updatedAt).toLocaleDateString("es-ES")}
            </p>
          )}
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
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md transition-all duration-200"
        >
          Eliminar
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed border border-blue-600 hover:border-blue-700 disabled:border-gray-300 rounded-md shadow-sm hover:shadow transition-all duration-200"
        >
          Guardar Cambios
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditBacklogTaskModal;

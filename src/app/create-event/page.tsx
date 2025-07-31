"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { localStorageService } from "@/services/localStorage";
import {
  ChevronLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
}

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState("");

  // Fecha mínima (hoy) para los inputs de fecha
  const today = new Date();
  const minDateTime = today.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: [],
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

  // Función para calcular endTime automáticamente (30 minutos después)
  const calculateEndTime = (startTimeString: string): string => {
    if (!startTimeString) return "";

    const startDate = new Date(startTimeString);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutos después
    return formatDateTimeLocal(endDate);
  };

  useEffect(() => {
    // Verificar si hay una fecha en los parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");

    if (dateParam) {
      // Parsear la fecha de forma local para evitar problemas de zona horaria
      const [year, month, day] = dateParam.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day); // month es 0-indexado

      if (!isNaN(selectedDate.getTime())) {
        // Configurar fecha de inicio a las 14:00 PM
        const startTime = new Date(year, month - 1, day, 14, 0);

        // Configurar fecha de fin 30 minutos después
        const endTime = new Date(year, month - 1, day, 14, 30);

        setFormData((prev) => ({
          ...prev,
          startTime: formatDateTimeLocal(startTime),
          endTime: formatDateTimeLocal(endTime),
        }));
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "startTime") {
      const autoEndTime = calculateEndTime(value);

      setFormData((prev) => ({
        ...prev,
        startTime: value,
        endTime: autoEndTime,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()],
      }));
      setAttendeeInput("");
    }
  };

  const removeAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) => a !== attendee),
    }));
  };

  const handleAttendeeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAttendee();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      // Crear fechas preservando la zona horaria local
      const parseLocalDateTime = (dateTimeString: string): Date => {
        const [datePart, timePart] = dateTimeString.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes);
      };

      await localStorageService.createEvent({
        title: formData.title,
        description: formData.description,
        startTime: parseLocalDateTime(formData.startTime),
        endTime: parseLocalDateTime(formData.endTime),
        location: formData.location,
        attendees: formData.attendees,
        userId: "local-user",
      });

      // Obtener la fecha del evento para navegar al calendario correcto
      const redirectUrl = "/?refresh=true";

      router.push(redirectUrl);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = () => {
    if (!formData.startTime || !formData.endTime) return "";

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Duración: ${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}m` : ""}`;
    }
    return diffMinutes > 0 ? `Duración: ${diffMinutes}m` : "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Nuevo Evento</h1>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-2" />
                Título del Evento *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Reunión de proyecto, Cumpleaños, Conferencia..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descripción opcional del evento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-2" />
                  Fecha y Hora de Inicio *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  min={minDateTime}
                  step="900"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-2" />
                  Fecha y Hora de Fin *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  min={minDateTime}
                  step="900"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {formatDuration() && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                {formatDuration()}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-2" />
                Ubicación
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Sala de juntas, Restaurant, Casa, Online..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <UserGroupIcon className="h-4 w-4 inline mr-2" />
                Participantes
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyPress={handleAttendeeKeyPress}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre del participante"
                />
                <button
                  type="button"
                  onClick={addAttendee}
                  disabled={!attendeeInput.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>

              {formData.attendees.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Participantes ({formData.attendees.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.attendees.map((attendee, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {attendee}
                        <button
                          type="button"
                          onClick={() => removeAttendee(attendee)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                disabled={
                  isSubmitting || !formData.title.trim() || !formData.startTime || !formData.endTime
                }
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Consejos:</h3>
          <ul className="text-sm text-blue-900 space-y-1">
            <li>• Los eventos aparecerán en tu calendario semanal</li>
            <li>• Puedes agregar múltiples participantes presionando Enter</li>
            <li>• La ubicación es opcional pero ayuda a recordar dónde es el evento</li>
            <li>• Los eventos se pueden editar y eliminar desde el calendario</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;

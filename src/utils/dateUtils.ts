/**
 * Utilidades para manejo de fechas y horas en la aplicación
 */

import { Task } from "@/types";

/**
 * Redondea los minutos de una fecha a cuartos de hora (0, 15, 30, 45)
 */
export const roundToQuarterHour = (date: Date): Date => {
  const newDate = new Date(date);
  const minutes = newDate.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  newDate.setMinutes(roundedMinutes, 0, 0); // También resetear segundos y milisegundos
  return newDate;
};

/**
 * Formatea una fecha a string en formato datetime-local (YYYY-MM-DDTHH:MM)
 * manteniendo la zona horaria local
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Parsea un string datetime-local y devuelve una fecha redondeada a cuarto de hora
 */
export const parseDateTimeLocalRounded = (dateTimeString: string): Date => {
  const date = new Date(dateTimeString);
  return roundToQuarterHour(date);
};

/**
 * Obtiene la fecha mínima (ahora) redondeada a cuarto de hora
 */
export const getMinDateTimeRounded = (): string => {
  const now = new Date();
  const rounded = roundToQuarterHour(now);
  return formatDateTimeLocal(rounded);
};

/**
 * Calcula una fecha de fin automáticamente (30 minutos después) redondeada
 */
export const calculateEndTime = (startTimeString: string, durationMinutes: number = 30): string => {
  if (!startTimeString) return "";

  const startDate = new Date(startTimeString);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const roundedEndDate = roundToQuarterHour(endDate);
  return formatDateTimeLocal(roundedEndDate);
};

/**
 * Maneja el cambio de input datetime-local forzando redondeo a cuartos de hora
 */
export const handleDateTimeChange = (value: string): string => {
  if (!value) return "";

  const date = new Date(value);
  const rounded = roundToQuarterHour(date);
  return formatDateTimeLocal(rounded);
};

// ===== UTILIDADES PARA FECHAS DE VENCIMIENTO =====

export enum DueDateStatus {
  OVERDUE = "overdue",
  DUE_SOON = "due_soon", // 3 días o menos
  ON_TIME = "on_time",
  NO_DUE_DATE = "no_due_date",
}

export interface DueDateInfo {
  status: DueDateStatus;
  daysUntilDue: number;
  message: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const getDueDateInfo = (task: Task): DueDateInfo => {
  if (!task.dueDate || task.completed) {
    return {
      status: DueDateStatus.NO_DUE_DATE,
      daysUntilDue: 0,
      message: "",
      color: "",
      bgColor: "",
      icon: "",
    };
  }

  const now = new Date();
  const dueDate = new Date(task.dueDate);

  // Calcular días hasta vencimiento (sin horas, solo fechas)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffTime = dueDateOnly.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    // Vencida
    const daysOverdue = Math.abs(daysUntilDue);
    return {
      status: DueDateStatus.OVERDUE,
      daysUntilDue,
      message: daysOverdue === 1 ? "Vencida ayer" : `Vencida hace ${daysOverdue}d`,
      color: "text-red-700",
      bgColor: "bg-red-100",
      icon: "⚠️",
    };
  } else if (daysUntilDue === 0) {
    // Vence hoy
    return {
      status: DueDateStatus.DUE_SOON,
      daysUntilDue,
      message: "Vence hoy",
      color: "text-orange-700",
      bgColor: "bg-orange-100",
      icon: "🔥",
    };
  } else if (daysUntilDue <= 3) {
    // Vence en 3 días o menos
    return {
      status: DueDateStatus.DUE_SOON,
      daysUntilDue,
      message: daysUntilDue === 1 ? "Vence mañana" : `Vence en ${daysUntilDue}d`,
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      icon: "⏰",
    };
  } else {
    // Todavía hay tiempo
    return {
      status: DueDateStatus.ON_TIME,
      daysUntilDue,
      message: `Vence en ${daysUntilDue}d`,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      icon: "📅",
    };
  }
};

export const formatDueDate = (dueDate: Date): string => {
  return dueDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

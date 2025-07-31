import { Task } from "@/types";

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

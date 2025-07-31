export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: Date; // Opcional para tareas en backlog
  dueDate?: Date; // Fecha de vencimiento opcional
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isBacklog?: boolean; // Nueva propiedad para identificar tareas del backlog
  isFavorite?: boolean; // Nueva propiedad para tareas favoritas
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskCategory {
  WORK = "work",
  PERSONAL = "personal",
  HEALTH = "health",
  EDUCATION = "education",
  SOCIAL = "social",
  OTHER = "other",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: TaskCategory;
  priority: TaskPriority;
  completed?: boolean;
  userId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  completed?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  userId: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
}

import { Task, Event, TaskCategory, TaskPriority } from "@/types";

class LocalStorageService {
  private tasksKey = "week-planner-tasks";
  private eventsKey = "week-planner-events";

  getTasks(): Task[] {
    try {
      const tasks = localStorage.getItem(this.tasksKey);
      if (!tasks) return this.getInitialTasks();

      const parsedTasks = JSON.parse(tasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error("Error reading tasks from localStorage:", error);
      return this.getInitialTasks();
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving tasks to localStorage:", error);
    }
  }

  createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Omit<Task, "id" | "createdAt">>): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) return null;

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveTasks(tasks);
    return tasks[taskIndex];
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const initialLength = tasks.length;
    const filteredTasks = tasks.filter((task) => task.id !== id);

    if (filteredTasks.length !== initialLength) {
      this.saveTasks(filteredTasks);
      return true;
    }
    return false;
  }

  // BACKLOG TASKS

  getBacklogTasks(): Task[] {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.isBacklog === true);
  }

  createBacklogTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "startTime" | "isBacklog">
  ): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      isBacklog: true,
      startTime: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  scheduleBacklogTask(id: string, startTime: Date): Task | null {
    return this.updateTask(id, {
      startTime,
      isBacklog: false,
    });
  }

  moveTaskToBacklog(id: string): Task | null {
    return this.updateTask(id, {
      startTime: undefined,
      isBacklog: true,
    });
  }

  // EVENTS

  getEvents(): Event[] {
    try {
      const events = localStorage.getItem(this.eventsKey);
      if (!events) return this.getInitialEvents();

      const parsedEvents = JSON.parse(events);
      return parsedEvents.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      }));
    } catch (error) {
      console.error("Error reading events from localStorage:", error);
      return this.getInitialEvents();
    }
  }

  saveEvents(events: Event[]): void {
    try {
      localStorage.setItem(this.eventsKey, JSON.stringify(events));
    } catch (error) {
      console.error("Error saving events to localStorage:", error);
    }
  }

  createEvent(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Event {
    const events = this.getEvents();
    const newEvent: Event = {
      ...eventData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Omit<Event, "id" | "createdAt">>): Event | null {
    const events = this.getEvents();
    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) return null;

    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveEvents(events);
    return events[eventIndex];
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const initialLength = events.length;
    const filteredEvents = events.filter((event) => event.id !== id);

    if (filteredEvents.length !== initialLength) {
      this.saveEvents(filteredEvents);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getInitialTasks(): Task[] {
    const sampleTasks: Task[] = [
      {
        id: this.generateId(),
        title: "Reunión de equipo",
        description: "Reunión semanal de planificación",
        startTime: new Date("2025-07-28T09:00:00"),
        category: TaskCategory.WORK,
        priority: TaskPriority.HIGH,
        completed: false,
        userId: "local-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Ejercicio matutino",
        description: "Rutina de ejercicios en el gimnasio",
        startTime: new Date("2025-07-28T07:00:00"),
        category: TaskCategory.HEALTH,
        priority: TaskPriority.MEDIUM,
        completed: true,
        userId: "local-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Estudiar TypeScript",
        description: "Revisar conceptos avanzados de TypeScript",
        startTime: new Date("2025-07-29T19:00:00"),
        category: TaskCategory.EDUCATION,
        priority: TaskPriority.MEDIUM,
        completed: false,
        userId: "local-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Leer libro de productividad",
        description: "Terminar de leer 'Atomic Habits'",
        category: TaskCategory.PERSONAL,
        priority: TaskPriority.LOW,
        completed: false,
        userId: "local-user",
        isBacklog: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Revisar código del proyecto",
        description: "Code review pendiente del último sprint",
        category: TaskCategory.WORK,
        priority: TaskPriority.HIGH,
        completed: false,
        userId: "local-user",
        isBacklog: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Planificar vacaciones",
        description: "Investigar destinos y hacer reservas",
        category: TaskCategory.PERSONAL,
        priority: TaskPriority.MEDIUM,
        completed: false,
        userId: "local-user",
        isBacklog: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.saveTasks(sampleTasks);
    return sampleTasks;
  }

  private getInitialEvents(): Event[] {
    const sampleEvents: Event[] = [
      {
        id: this.generateId(),
        title: "Conferencia de React",
        description: "Conferencia anual sobre React y tecnologías modernas",
        startTime: new Date("2025-07-30T09:00:00"),
        endTime: new Date("2025-07-30T17:00:00"),
        location: "Centro de Convenciones",
        attendees: ["juan@example.com", "maria@example.com"],
        userId: "local-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: this.generateId(),
        title: "Cena familiar",
        description: "Cena de cumpleaños de mamá",
        startTime: new Date("2025-07-31T19:00:00"),
        endTime: new Date("2025-07-31T22:00:00"),
        location: "Restaurante El Jardín",
        attendees: ["papa@example.com", "hermana@example.com"],
        userId: "local-user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.saveEvents(sampleEvents);
    return sampleEvents;
  }

  getTasksByDateRange(startDate: Date, endDate: Date): Task[] {
    const tasks = this.getTasks();
    return tasks.filter(
      (task) => task.startTime && task.startTime >= startDate && task.startTime <= endDate
    );
  }

  getEventsByDateRange(startDate: Date, endDate: Date): Event[] {
    const events = this.getEvents();
    return events.filter((event) => event.startTime >= startDate && event.startTime <= endDate);
  }

  markTaskCompleted(id: string): Task | null {
    return this.updateTask(id, { completed: true });
  }

  markTaskIncomplete(id: string): Task | null {
    return this.updateTask(id, { completed: false });
  }

  clearAllData(): void {
    localStorage.removeItem(this.tasksKey);
    localStorage.removeItem(this.eventsKey);
  }
}

export const localStorageService = new LocalStorageService();

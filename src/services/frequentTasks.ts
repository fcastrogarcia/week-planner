export interface FrequentTask {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  estimatedDuration?: number; // en minutos
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  tags?: string[]; // Nueva propiedad para mejor categorización
}

export const DEFAULT_FREQUENT_TASKS: Omit<
  FrequentTask,
  "id" | "usageCount" | "lastUsed" | "createdAt"
>[] = [
  {
    title: "Ir al supermercado",
    description: "Comprar comestibles y productos básicos",
    category: "PERSONAL",
    priority: "MEDIUM",
    estimatedDuration: 60,
  },
  {
    title: "Ir al lavadero",
    description: "Llevar ropa para lavar",
    category: "PERSONAL",
    priority: "LOW",
    estimatedDuration: 30,
  },
  {
    title: "Ejercicio rutinario",
    description: "Sesión de ejercicio diario",
    category: "HEALTH",
    priority: "MEDIUM",
    estimatedDuration: 45,
  },
  {
    title: "Reunión de equipo",
    description: "Reunión semanal del equipo",
    category: "WORK",
    priority: "HIGH",
    estimatedDuration: 60,
  },
  {
    title: "Llamar a la familia",
    description: "Llamada familiar semanal",
    category: "SOCIAL",
    priority: "MEDIUM",
    estimatedDuration: 30,
  },
];

class FrequentTasksService {
  private frequentTasksKey = "week-planner-frequent-tasks";

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getFrequentTasks(): FrequentTask[] {
    try {
      const stored = localStorage.getItem(this.frequentTasksKey);
      if (!stored) {
        const defaultTasks = this.initializeDefaultTasks();
        this.saveFrequentTasks(defaultTasks);
        return defaultTasks;
      }

      const parsed = JSON.parse(stored);
      return parsed.map(
        (task: Partial<FrequentTask> & { lastUsed: string; createdAt: string }) => ({
          ...task,
          lastUsed: new Date(task.lastUsed),
          createdAt: new Date(task.createdAt),
        })
      );
    } catch (error) {
      console.error("Error reading frequent tasks:", error);
      return this.initializeDefaultTasks();
    }
  }

  private initializeDefaultTasks(): FrequentTask[] {
    return DEFAULT_FREQUENT_TASKS.map((task) => ({
      ...task,
      id: this.generateId(),
      usageCount: 0,
      lastUsed: new Date(),
      createdAt: new Date(),
    }));
  }

  saveFrequentTasks(tasks: FrequentTask[]): void {
    try {
      localStorage.setItem(this.frequentTasksKey, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error saving frequent tasks:", error);
    }
  }

  addFrequentTask(
    taskData: Omit<FrequentTask, "id" | "usageCount" | "lastUsed" | "createdAt">
  ): FrequentTask {
    const tasks = this.getFrequentTasks();
    const newTask: FrequentTask = {
      ...taskData,
      id: this.generateId(),
      usageCount: 0,
      lastUsed: new Date(),
      createdAt: new Date(),
    };

    tasks.push(newTask);
    this.saveFrequentTasks(tasks);
    return newTask;
  }

  useFrequentTask(id: string): void {
    const tasks = this.getFrequentTasks();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.usageCount++;
      task.lastUsed = new Date();
      this.saveFrequentTasks(tasks);
    }
  }

  deleteFrequentTask(id: string): boolean {
    const tasks = this.getFrequentTasks();
    const filteredTasks = tasks.filter((task) => task.id !== id);
    if (filteredTasks.length !== tasks.length) {
      this.saveFrequentTasks(filteredTasks);
      return true;
    }
    return false;
  }

  getMostUsedTasks(limit: number = 5): FrequentTask[] {
    const tasks = this.getFrequentTasks();
    return tasks.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
  }

  getRecentlyUsedTasks(limit: number = 5): FrequentTask[] {
    const tasks = this.getFrequentTasks();
    return tasks.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()).slice(0, limit);
  }

  // Nuevos métodos para escalabilidad
  searchTasks(query: string): FrequentTask[] {
    const tasks = this.getFrequentTasks();
    const searchTerm = query.toLowerCase();

    return tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      )
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  getTasksByCategory(category: string): FrequentTask[] {
    const tasks = this.getFrequentTasks();
    return tasks
      .filter((task) => task.category === category)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  getAllCategories(): string[] {
    const tasks = this.getFrequentTasks();
    const categories = new Set(tasks.map((task) => task.category));
    return Array.from(categories).sort();
  }

  getTopTasksByCategory(limit: number = 3): Record<string, FrequentTask[]> {
    const categories = this.getAllCategories();
    const result: Record<string, FrequentTask[]> = {};

    categories.forEach((category) => {
      result[category] = this.getTasksByCategory(category).slice(0, limit);
    });

    return result;
  }
}

export const frequentTasksService = new FrequentTasksService();

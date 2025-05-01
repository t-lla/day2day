import { Task } from "../../types.js";

export class TasksModel {
  loadTasks(): Task[] {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks);
    } else {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const initialTasks: Task[] = [
        {
          id: "1",
          title: "idk 1",
          description: "acabar ya con esto",
          dueDate: tomorrow.toISOString().split("T")[0],
          priority: "high",
          completed: false,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "2",
          title: "idk 2",
          description: "squat 300",
          dueDate: today.toISOString().split("T")[0],
          priority: "medium",
          completed: true,
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ];
      this.saveTasks(initialTasks);
      return initialTasks;
    }
  }

  saveTasks(tasks: Task[]): void {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}
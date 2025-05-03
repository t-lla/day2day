/**
 * @packageDocumentation
 * @module TasksModel
 *
 * Model responsible for loading and saving task data within localStorage.
 */
import { Task } from "../../types.js";

/**
 * TasksModel provides methods to retrieve persisted tasks from localStorage
 * and initialize default tasks if none exist.
 */
export class TasksModel {
  /**
   * Loads tasks from localStorage. If no tasks are found, initializes
   * with a set of default tasks and persists them.
   *
   * @returns An array of Task objects.
   * @example
   * const model = new TasksModel();
   * const tasks = model.loadTasks();
   */
  loadTasks(): Task[] {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks) as Task[];
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

  /**
   * Persists the given array of tasks into localStorage under the key 'tasks'.
   * Serializes the tasks as JSON for storage.
   *
   * @param tasks - The array of Task objects to store.
   * @example
   * const model = new TasksModel();
   * model.saveTasks([{ id: "1", title: "new task", ... }]);
   */
  saveTasks(tasks: Task[]): void {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

/**
 * @packageDocumentation
 * @module TasksController
 *
 * Controller responsible for managing task operations: loading, creating,
 * editing, deleting, filtering, and persisting tasks in the application.
 * Interacts between the TasksModel for data persistence and the TasksView for UI rendering.
 */
import { TasksModel } from "./tasks.model.js";
import { TasksView } from "./tasks.view.js";
import { Task } from "../../types.js";
import { formatDate } from "../../router.js";
import { apiService } from "../../services/api.service.js";
import { syncService } from '../../services/sync.service.js';
import { storageService } from "../../services/storage.service.js";
import type { ApiResponse } from "../../types.js";

/** Maintains task state, handles user events, and applies filters */
export class TasksController {
  private model: TasksModel;
  protected tasks: Task[] = [];
  private currentFilter: "all" | "active" | "completed" = "all";

  /**
   * Initializes a new TasksController with a TasksModel instance.
   * Sets up the model for task persistence.
   */
  constructor() {
    this.model = new TasksModel();
  }

  /* Defines property to hold down the task-under-edit. */
  private editingTask: Task | null = null;

  /**
   * Initializes the tasks feature by rendering the view, loading tasks,
   * and binding event listeners for UI controls.
   *
   * @param selector - CSS selector of the container where tasks will be injected.
   * @returns A promise that resolves when initialization is complete.
   * @example
   * await controller.init('#content');
   */
  async init(selector: string): Promise<void> {
    await TasksView.render(selector);

    if (apiService.isAuthenticated()) {
      const res = await apiService.getTasks();
      if (res.data) {
        this.tasks = res.data;
        this.model.saveTasks(res.data);
      } else {
        this.tasks = this.model.loadTasks();
      }
    } else {
      this.tasks = this.model.loadTasks();
    }

    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");
    const taskForm = document.getElementById("taskForm") as HTMLFormElement;
    const filterAll = document.getElementById("filterAll");
    const filterActive = document.getElementById("filterActive");
    const filterCompleted = document.getElementById("filterCompleted");

    addTaskBtn?.addEventListener("click", () => {
      this.showTaskForm(null);
    });

    cancelTaskBtn?.addEventListener("click", () => {
      this.showTasksList();
    });

    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveTask();
    });

    filterAll?.addEventListener("click", () => {
      this.currentFilter = "all";
      this.renderTasks();
    });

    filterActive?.addEventListener("click", () => {
      this.currentFilter = "active";
      this.renderTasks();
    });

    filterCompleted?.addEventListener("click", () => {
      this.currentFilter = "completed";
      this.renderTasks();
    });

    this.renderTasks();
  }

  /**
   * @private
   * Shows the tasks list view and hides the task form.
   */
  private showTasksList(): void {
    TasksView.toggleVisibility("tasksList", true);
    TasksView.toggleVisibility("taskFormContainer", false);
    TasksView.toggleVisibility("addTaskBtn", true);
  }

  /**
   * @private
   * Displays the task form for creating or editing a task.
   * Populates the form with task data or clears it for a new task.
   *
   * @param task - The Task to edit, or null to create a new one.
   * @example
   * controller.showTaskForm({ id: "1", title: "new task", ... });
   */
  private showTaskForm(task: Task | null): void {
    TasksView.toggleVisibility("tasksList", false);
    TasksView.toggleVisibility("taskFormContainer", true);
    TasksView.toggleVisibility("addTaskBtn", false);

    const title = task ? task.title : "";
    const description = task ? task.description : "";
    const dueDate = task ? task.dueDate || "" : "";
    const priority = task ? task.priority : "low" as Task["priority"];

    const taskFormContainer = document.getElementById("taskFormContainer");
    TasksView.renderTaskForm(
      task,
      taskFormContainer,
      title,
      description,
      dueDate,
      priority
    );

    const taskForm = document.getElementById("taskForm") as HTMLFormElement;
    taskForm.addEventListener("submit", e => {
    e.preventDefault();
    this.saveTask();
    });

    document.getElementById("cancelTaskBtn")?.addEventListener("click", () => {
      this.showTasksList();
    });
  }

  /**
   * @protected //due to tasks.enhanced.ts import
   * Saves a new or existing task based on form input values.
   * Either updates the tasks array and/or persists changes via the model.
   */
  protected async saveTask(): Promise<void> {
  const titleInput = document.getElementById("taskTitle") as HTMLInputElement;
  const descInput  = document.getElementById("taskDescription") as HTMLTextAreaElement;
  const dueInput   = document.getElementById("taskDueDate") as HTMLInputElement;
  const prioInput  = document.getElementById("taskPriority") as HTMLSelectElement;

  const isEditing = !!this.editingTask;
  const existing  = this.editingTask!;

  const payload = {
    userId:   Number(localStorage.getItem("current_user_id")),
    title:       titleInput.value,
    description: descInput.value,
    dueDate:     dueInput.value || null,
    priority:    prioInput.value as Task["priority"],
    completed:   isEditing ? existing.completed : false,
    createdAt:   isEditing ? existing.createdAt : new Date().toISOString(),
  };

  try {
    let res: ApiResponse<Task>;
    if (isEditing) {
      res = await apiService.request<Task>(
        `/tasks/${existing.id}`,
        { method: "PUT", body: JSON.stringify(payload) }
      );
    } else {
      res = await apiService.createTask(payload);
    }

    if (!res.data) throw new Error(res.error || "Unknown server error");

    if (isEditing) {
      this.tasks = this.tasks.map(t => t.id === res.data!.id.toString() ? res.data! : t);
    } else {
      this.tasks.push(res.data);
    }

    storageService.set("tasks", this.tasks);

    window.alert("✅ Task saved!");
  }
  catch (err) {
    console.error("Error syncing task:", err);
    window.alert("❌ Error syncing task");
  }
  finally {
    this.editingTask = null;
    this.renderTasks();
    this.showTasksList();
  }
}

  /**
   * @private
   * Toggles the completion state of the task with the given id.
   *
   * @param id - Identifier of the task to toggle.
   */
  private toggleTaskCompletion = async (id: string): Promise<void> => {

    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;

    if (apiService.isAuthenticated()) {
      try {
        const payload = {
          title:       task.title,
          description: task.description,
          dueDate:     task.dueDate,
          priority:    task.priority,
          completed:   task.completed,
        };
        const res: ApiResponse<Task> = await apiService.updateTask(id, payload);
        if (res.data) {

          this.tasks = this.tasks.map((t) => (t.id === id ? res.data! : t));

          this.model.saveTasks(this.tasks);
        } else {
          console.error("Error al actualizar tarea:", res.error);
          window.alert("No se pudo actualizar el estado de la tarea en el servidor.");

          task.completed = !task.completed;
        }
      } catch (err) {
        console.error("Error de red al actualizar tarea:", err);

        task.completed = !task.completed;
      }
    } else {

      this.model.saveTasks(this.tasks);

      syncService.queueOperation({
        type:    "update",
        entity:  "task",
        data:    { id, completed: task.completed },
      });
    }

    document.dispatchEvent(new CustomEvent("taskStatusChanged", { detail: { taskId: id } }));

    this.renderTasks();
  };

  /**
   * Opens the task form to edit an existing task.
   *
   * @param id - Identifier of the task to edit.
   * @example
   * controller.toggleTaskCompletion("1");
   */
  private editTask = (id: string): void => {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    this.editingTask = task;
    this.showTaskForm(task);
  };

  /**
   * @private
   * Deletes the task with the specified id after confirmation.
   *
   * @param id - Identifier of the task to delete.
   * @example
   * controller.deleteTask("1");
   */
  private deleteTask = async (id: string): Promise<void> => {
    if (!confirm("¿Estás seguro/a de que quieres eliminar esta tarea?")) return;

    if (apiService.isAuthenticated()) {
      const res = await apiService.deleteTask(id);
      if (!res.data) {
        console.error("Error al borrar tarea en el servidor:", res.error);
        alert("No se pudo eliminar la tarea en el servidor.");
        return;
      }
    }

    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.model.saveTasks(this.tasks);
    this.renderTasks();
  };

  /**
   * @private
   * Renders the tasks list in the UI based on the current filter.
   */
  private renderTasks(): void {
    const tasksList = document.getElementById("tasksList");
    TasksView.renderTasksList(
      this.tasks,
      this.currentFilter,
      tasksList,
      this.toggleTaskCompletion,
      this.editTask,
      this.deleteTask
    );

    document.getElementById("filterAll")?.addEventListener("click", () => {
      this.currentFilter = "all";
      this.renderTasks();
    });
    document.getElementById("filterActive")?.addEventListener("click", () => {
      this.currentFilter = "active";
      this.renderTasks();
    });
    document.getElementById("filterCompleted")?.addEventListener("click", () => {
      this.currentFilter = "completed";
      this.renderTasks();
    });
    
  }
}

/** Singleton instance of the TasksController to maintain task state. */
let tasksController: TasksController | null = null;

/**
 * Initializes the TasksController singleton and renders tasks into the content area.
 *
 * @returns A promise that resolves when tasks are initialized.
 * @example
 * await initTasks();
 */
export function initTasks(): Promise<void> {
  if (!tasksController) {
    tasksController = new TasksController();
  }
  return tasksController.init("#content");
}

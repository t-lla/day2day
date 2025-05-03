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

/** Maintains task state, handles user events, and applies filters */
export class TasksController {
  private model: TasksModel;
  private tasks: Task[] = [];
  private currentFilter: "all" | "active" | "completed" = "all";

  /**
   * Initializes a new TasksController with a TasksModel instance.
   * Sets up the model for task persistence.
   */
  constructor() {
    this.model = new TasksModel();
  }

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

    this.tasks = this.model.loadTasks();

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

    document.getElementById("cancelTaskBtn")?.addEventListener("click", () => {
      this.showTasksList();
    });
  }

  /**
   * @private
   * Saves a new or existing task based on form input values.
   * Either updates the tasks array and/or persists changes via the model.
   */
  private saveTask(): void {
    const titleInput = document.getElementById("taskTitle") as HTMLInputElement;
    const descInput = document.getElementById("taskDescription") as HTMLTextAreaElement;
    const dueInput = document.getElementById("taskDueDate") as HTMLInputElement;
    const prioInput = document.getElementById("taskPriority") as HTMLSelectElement;
    const taskIdInput = document.getElementById("taskId") as HTMLInputElement | null;

    if (taskIdInput?.value) {
      //edit existing
      const idx = this.tasks.findIndex((t) => t.id === taskIdInput.value);
      if (idx !== -1) {
        this.tasks[idx] = {
          ...this.tasks[idx],
          title: titleInput.value,
          description: descInput.value,
          dueDate: dueInput.value || null,
          priority: prioInput.value as Task["priority"],
        };
      }
    } else {
      //create new
      const newTask: Task = {
        id: Date.now().toString(),
        title: titleInput.value,
        description: descInput.value,
        dueDate: dueInput.value || null,
        priority: prioInput.value as Task["priority"],
        completed: false,
        createdAt: new Date().toISOString(),
      };
      this.tasks.push(newTask);
    }

    this.model.saveTasks(this.tasks);
    this.renderTasks();
    this.showTasksList();
  }

  /**
   * @private
   * Toggles the completion state of the task with the given id.
   *
   * @param id - Identifier of the task to toggle.
   */
  private toggleTaskCompletion = (id: string): void => {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.model.saveTasks(this.tasks);
      this.renderTasks();
    }
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
    if (task) this.showTaskForm(task);
  };

  /**
   * @private
   * Deletes the task with the specified id after confirmation.
   *
   * @param id - Identifier of the task to delete.
   * @example
   * controller.deleteTask("1");
   */
  private deleteTask = (id: string): void => {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.model.saveTasks(this.tasks);
      this.renderTasks();
    }
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

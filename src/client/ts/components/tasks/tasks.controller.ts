import { TasksModel } from "./tasks.model.js";
import { TasksView } from "./tasks.view.js";
import { Task } from "../../types.js";
import { formatDate } from "../../router.js";

export class TasksController {
  private model: TasksModel;
  private tasks: Task[] = [];
  private currentFilter: "all" | "active" | "completed" = "all";

  constructor() {
    this.model = new TasksModel();
  }

  async init(selector: string): Promise<void> {
    await TasksView.render(selector);

    this.tasks = this.model.loadTasks();

    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");

    addTaskBtn?.addEventListener("click", () => {
      this.showTaskForm(null);
    });

    cancelTaskBtn?.addEventListener("click", () => {
      this.showTasksList();
    });

    const taskForm = document.getElementById("taskForm") as HTMLFormElement;
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveTask();
    });

    const filterAll = document.getElementById("filterAll");
    const filterActive = document.getElementById("filterActive");
    const filterCompleted = document.getElementById("filterCompleted");

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

  private showTasksList(): void {
    TasksView.toggleVisibility("tasksList", true);
    TasksView.toggleVisibility("taskFormContainer", false);
    TasksView.toggleVisibility("addTaskBtn", true);
  }

  private showTaskForm(task: Task | null): void {
    TasksView.toggleVisibility("tasksList", false);
    TasksView.toggleVisibility("taskFormContainer", true);
    TasksView.toggleVisibility("addTaskBtn", false);

    const title = task ? task.title : "";
    const description = task ? task.description : "";
    const dueDate = task ? task.dueDate || "" : "";
    const priority = task ? task.priority : "low";

    const taskFormContainer = document.getElementById("taskFormContainer");
    TasksView.renderTaskForm(
      task,
      taskFormContainer,
      title,
      description,
      dueDate,
      priority
    );

    const cancelTaskBtn = document.getElementById("cancelTaskBtn");
    cancelTaskBtn?.addEventListener("click", () => {
      this.showTasksList();
    });
  }

  private saveTask(): void {
    const titleInput = document.getElementById("taskTitle") as HTMLInputElement;
    const descInput = document.getElementById(
      "taskDescription"
    ) as HTMLTextAreaElement;
    const dueInput = document.getElementById("taskDueDate") as HTMLInputElement;
    const prioInput = document.getElementById(
      "taskPriority"
    ) as HTMLSelectElement;

    const taskIdInput = document.getElementById(
      "taskId"
    ) as HTMLInputElement | null;
    if (taskIdInput?.value) {
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

  private toggleTaskCompletion = (id: string): void => {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.model.saveTasks(this.tasks);
      this.renderTasks();
    }
  };

  private editTask = (id: string): void => {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    this.showTaskForm(task);
  };

  private deleteTask = (id: string): void => {
    if (confirm("ure you want to delete this?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.model.saveTasks(this.tasks);
      this.renderTasks();
    }
  };

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

let tasksController: TasksController | null = null;

export function initTasks(): Promise<void> {
  if (!tasksController) {
    tasksController = new TasksController();
  }
  return tasksController.init("#content");
}
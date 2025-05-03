/**
 * @packageDocumentation
 * @module TasksView
 *
 * Provides methods for rendering task UI components, including
 * task lists, forms, and interaction handlers.
 */
import { Task } from "../../types.js";
import { formatDate } from "../../router.js";
import { loadComponent } from "../loader.js";

/**
 * TasksView offers static functions to load the tasks template
 * and manage the DOM updates for listing, filtering, and editing tasks.
 */
export class TasksView {
  /**
   * Renders the main tasks component into the specified container.
   * Loads the tasks HTML template for the UI.
   *
   * @param selector - CSS selector of the element where the tasks view will be injected.
   * @returns A promise that resolves when the component is loaded.
   * @example
   * await TasksView.render('#content');
   */
  static async render(selector: string): Promise<void> {
    return loadComponent(selector, "../../components/tasks.html");
  }

  /**
   * Displays a list of tasks with filtering, sorting, and action callbacks.
   * Renders tasks based on the current filter and binds event handlers for interactions.
   *
   * @param tasks - Array of Task objects to render.
   * @param filter - Current filter: "all", "active", or "completed".
   * @param tasksList - The DOM element where the tasks list should be rendered.
   * @param toggleTaskCompletionCallback - Callback when a task checkbox toggles.
   * @param editTaskCallback - Callback when edit button clicked.
   * @param deleteTaskCallback - Callback when delete button clicked.
   * @example
   * const tasks = [{ id: "1", title: "new task", ... }];
   * TasksView.renderTasksList(tasks, 'all', document.getElementById('tasksList'), toggle, edit, delete);
   */
  static renderTasksList(
    tasks: Task[],
    filter: "all" | "active" | "completed",
    tasksList: HTMLElement | null,
    toggleTaskCompletionCallback: (id: string) => void,
    editTaskCallback: (id: string) => void,
    deleteTaskCallback: (id: string) => void
  ): void {
    if (!tasksList) return;

    let filteredTasks = tasks;

    if (filter === "active") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (filter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    if (filteredTasks.length === 0) {
      tasksList.innerHTML = `
        <div class="filter-tabs">
          <button id="filterAll" class="filter-tab">all</button>
          <button id="filterActive" class="filter-tab">active</button>
          <button id="filterCompleted" class="filter-tab">completed</button>
        </div>
        <p>> no tasks found</p>
      `;
      TasksView.setActiveFilter(filter);

      document.getElementById("filterAll")?.addEventListener("click", () => {
        TasksView.setActiveFilter("all");
      });

      document.getElementById("filterActive")?.addEventListener("click", () => {
        TasksView.setActiveFilter("active");
      });

      document
        .getElementById("filterCompleted")
        ?.addEventListener("click", () => {
          TasksView.setActiveFilter("completed");
        });
      return;
    }

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (a.dueDate !== b.dueDate) {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    tasksList.innerHTML = `
      <div class="filter-tabs">
        <button id="filterAll" class="filter-tab">all</button>
        <button id="filterActive" class="filter-tab">active</button>
        <button id="filterCompleted" class="filter-tab">completed</button>
      </div>
      <h3>> your tasks</h3>
    `;

    TasksView.setActiveFilter(filter);

    const taskItems = document.createElement("div");
    taskItems.className = "task-items";

    sortedTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
      taskItem.setAttribute("data-id", task.id);

      const isOverdue =
        task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

      taskItem.innerHTML = `
        <div class="task-header">
          <div class="task-checkbox-title">
            <input type="checkbox" class="task-checkbox" ${
              task.completed ? "checked" : ""
            }>
            <h4 class="task-title">${task.title}</h4>
          </div>
          <div class="task-priority ${task.priority}">${task.priority}</div>
        </div>

        <div class="task-description">${task.description}</div>

        <div class="task-footer">
          <div class="task-due-date ${isOverdue ? "overdue" : ""}">
            ${
              task.dueDate
                ? `due ${formatDate(new Date(task.dueDate))}`
                : "no due date"
            }
            ${isOverdue ? " (overdue)" : ""}
          </div>
          <div class="task-actions">
            <button class="action-btn edit-task-btn">edit</button>
            <button class="action-btn delete-task-btn">delete</button>
          </div>
        </div>
      `;

      taskItems.appendChild(taskItem);
    });

    tasksList.appendChild(taskItems);

    document.getElementById("filterAll")?.addEventListener("click", () => {
      TasksView.setActiveFilter("all");
    });

    document.getElementById("filterActive")?.addEventListener("click", () => {
      TasksView.setActiveFilter("active");
    });

    document
      .getElementById("filterCompleted")
      ?.addEventListener("click", () => {
        TasksView.setActiveFilter("completed");
      });

    document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const taskId = (e.target as HTMLElement)
          .closest(".task-item")
          ?.getAttribute("data-id");
        if (taskId) {
          toggleTaskCompletionCallback(taskId);
        }
      });
    });

    document.querySelectorAll(".edit-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = (e.target as HTMLElement)
          .closest(".task-item")
          ?.getAttribute("data-id");
        if (taskId) {
          editTaskCallback(taskId);
        }
      });
    });

    document.querySelectorAll(".delete-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = (e.target as HTMLElement)
          .closest(".task-item")
          ?.getAttribute("data-id");
        if (taskId) {
          deleteTaskCallback(taskId);
        }
      });
    });
  }

  /**
   * Renders the task creation/edit form with provided default values.
   * Populates the form with task data or clears it for a new task.
   *
   * @param task - The Task object to edit, or null to create a new one.
   * @param taskFormContainer - The DOM element where the form will be rendered.
   * @param title - Default title text for the form input.
   * @param description - Default description text for the textarea.
   * @param dueDate - Default due date value for the date input.
   * @param priority - Default priority value for the select input.
   * @example
   * TasksView.renderTaskForm(null, document.getElementById('taskFormContainer'), '', '', '', 'low');
   */
  static renderTaskForm(
    task: Task | null,
    taskFormContainer: HTMLElement | null,
    title: string,
    description: string,
    dueDate: string,
    priority: string
  ): void {
    if (!taskFormContainer) return;

    taskFormContainer.innerHTML = `
      <h3>> ${task ? "edit task" : "add task"}</h3>
      <form id="taskForm" class="data-form">
        <div class="form-group">
          <label for="taskTitle">title</label>
          <input type="text" id="taskTitle" value="${title}" required>
        </div>

        <div class="form-group">
          <label for="taskDescription">content</label>
          <textarea id="taskDescription" rows="3">${description}</textarea>
        </div>

        <div class="form-group">
          <label for="taskDueDate">due</label>
          <input type="date" id="taskDueDate" value="${dueDate}">
        </div>

        <div class="form-group">
          <label for="taskPriority">priority</label>
          <select id="taskPriority">
            <option value="low" ${priority === "low" ? "selected" : ""}>low</option>
            <option value="medium" ${priority === "medium" ? "selected" : ""}>medium</option>
            <option value="high" ${priority === "high" ? "selected" : ""}>high</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="action-btn">save</button>
          <button type="button" id="cancelTaskBtn" class="action-btn">cancel</button>
        </div>
      </form>
    `;
  }

  /**
   * Toggles visibility of an element by adding or removing the "hidden" class.
   *
   * @param elementId - The ID of the element to show or hide.
   * @param show - True to show the element; false to hide it.
   * @example
   * TasksView.toggleVisibility('tasksList', true);
   */
  static toggleVisibility(elementId: string, show: boolean): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle("hidden", !show);
    }
  }

  /**
   * @private
   * Updates the active filter tab styling based on the current filter.
   *
   * @param filter - The current filter: "all", "active", or "completed".
   * @example
   * TasksView.setActiveFilter('active');
   */
  private static setActiveFilter(filter: string): void {
    document
      .getElementById("filterAll")
      ?.classList.toggle("active", filter === "all");
    document
      .getElementById("filterActive")
      ?.classList.toggle("active", filter === "active");
    document
      .getElementById("filterCompleted")
      ?.classList.toggle("active", filter === "completed");
  }
}

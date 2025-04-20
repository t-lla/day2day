import { formatDate } from "../router.js";
import { loadComponent } from "./loader.js";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: string;
}

let tasks: Task[] = [];

export async function initTasks(): Promise<void> {
  await loadComponent("#content", "../../components/tasks.html");

  loadTasks();

  const addTaskBtn = document.getElementById("addTaskBtn");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");
  const filterAll = document.getElementById("filterAll");
  const filterActive = document.getElementById("filterActive");
  const filterCompleted = document.getElementById("filterCompleted");

  addTaskBtn?.addEventListener("click", () => {
    document.getElementById("tasksList")?.classList.add("hidden");
    document.getElementById("taskFormContainer")?.classList.remove("hidden");
    addTaskBtn.classList.add("hidden");
  });

  cancelTaskBtn?.addEventListener("click", () => {
    document.getElementById("tasksList")?.classList.remove("hidden");
    document.getElementById("taskFormContainer")?.classList.add("hidden");
    addTaskBtn?.classList.remove("hidden");
    (taskForm as HTMLFormElement)?.reset();
  });

  const taskForm = document.getElementById("taskForm") as HTMLFormElement;
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

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
      const idx = tasks.findIndex((t) => t.id === taskIdInput.value); //edit or add
      if (idx !== -1) {
        tasks[idx] = {
          ...tasks[idx],  //edit task keeping all previous data
          title: titleInput.value,
          description: descInput.value,
          dueDate: dueInput.value || null,
          priority: prioInput.value as Task["priority"],
        };
      }
      taskForm.removeChild(taskIdInput);
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
      tasks.push(newTask);
    }

    saveTasks();
    renderTasks();

    taskForm.reset();
    document.getElementById("tasksList")?.classList.remove("hidden");
    document.getElementById("taskFormContainer")?.classList.add("hidden");
    document.getElementById("addTaskBtn")?.classList.remove("hidden");
  });

  filterAll?.addEventListener("click", () => {
    setActiveFilter("all");
    renderTasks("all");
  });

  filterActive?.addEventListener("click", () => {
    setActiveFilter("active");
    renderTasks("active");
  });

  filterCompleted?.addEventListener("click", () => {
    setActiveFilter("completed");
    renderTasks("completed");
  });

  setActiveFilter("all");
  renderTasks("all");
}

function loadTasks(): void {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks = [
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
    saveTasks();
  }
}

function saveTasks(): void {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function setActiveFilter(filter: string): void {
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

function renderTasks(filter: "all" | "active" | "completed" = "all"): void {
  const tasksList = document.getElementById("tasksList");
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
    setActiveFilter(filter);

    document.getElementById("filterAll")?.addEventListener("click", () => {
      setActiveFilter("all");
      renderTasks("all");
    });

    document.getElementById("filterActive")?.addEventListener("click", () => {
      setActiveFilter("active");
      renderTasks("active");
    });

    document
      .getElementById("filterCompleted")
      ?.addEventListener("click", () => {
        setActiveFilter("completed");
        renderTasks("completed");
      });
    return;
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      //sort first uncompleted
      return a.completed ? 1 : -1;
    }

    if (a.dueDate !== b.dueDate) {
      //then sort by due
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 }; //then by priority
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

  setActiveFilter(filter);

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
          <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
          <h4 class="task-title">${task.title}</h4>
        </div>
        <div class="task-priority ${task.priority}">${task.priority}</div>
      </div>
      
      <div class="task-description">${task.description}</div>
      
      <div class="task-footer">
        <div class="task-due-date ${isOverdue ? "overdue" : ""}">
          ${task.dueDate ? `due ${formatDate(new Date(task.dueDate))}` : "no due date"}
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
    setActiveFilter("all");
    renderTasks("all");
  });

  document.getElementById("filterActive")?.addEventListener("click", () => {
    setActiveFilter("active");
    renderTasks("active");
  });

  document.getElementById("filterCompleted")?.addEventListener("click", () => {
    setActiveFilter("completed");
    renderTasks("completed");
  });

  document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const taskId = (e.target as HTMLElement)
        .closest(".task-item")
        ?.getAttribute("data-id");
      if (taskId) {
        toggleTaskCompletion(taskId);
      }
    });
  });

  document.querySelectorAll(".edit-task-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const taskId = (e.target as HTMLElement)
        .closest(".task-item")
        ?.getAttribute("data-id");
      if (taskId) {
        editTask(taskId);
      }
    });
  });

  document.querySelectorAll(".delete-task-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const taskId = (e.target as HTMLElement)
        .closest(".task-item")
        ?.getAttribute("data-id");
      if (taskId) {
        deleteTask(taskId);
      }
    });
  });
}

function toggleTaskCompletion(id: string): void {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function editTask(id: string): void {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  (document.getElementById("taskTitle") as HTMLInputElement).value = task.title;
  (document.getElementById("taskDescription") as HTMLTextAreaElement).value = task.description;
  (document.getElementById("taskDueDate") as HTMLInputElement).value = task.dueDate || "";
  (document.getElementById("taskPriority") as HTMLSelectElement).value = task.priority;

  let taskIdInput = document.getElementById("taskId") as HTMLInputElement | null;
  if (!taskIdInput) {
    taskIdInput = document.createElement("input");
    taskIdInput.type = "hidden";
    taskIdInput.id = "taskId";
    (document.getElementById("taskForm") as HTMLFormElement).appendChild(taskIdInput);
  }
  
  taskIdInput.value = task.id;

  document.getElementById("tasksList")?.classList.add("hidden");
  document.getElementById("taskFormContainer")?.classList.remove("hidden");
  document.getElementById("addTaskBtn")?.classList.add("hidden");
}

function deleteTask(id: string): void {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

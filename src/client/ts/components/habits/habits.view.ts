import { calculateStreak } from "./habits.model.js";
import { formatDate } from "../../router.js";
import { Habit } from "../../types.js";

/** Renders the list of habits with complete/uncomplete toggle buttons. */
export function renderHabitsList(
  container: HTMLElement,
  habits: Habit[],
  onView: (id: string) => void,
  onToggleComplete: (id: string) => void
) {
  if (habits.length === 0) {
    container.innerHTML = `<p>> no habits found. add one to get started.</p>`;
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  let html = `
    <h3>> your habits</h3>
    <table class="habits-table">
      <thead>
        <tr><th>name</th><th>frequency</th><th>streak</th><th>actions</th></tr>
      </thead>
      <tbody>`;

  habits.forEach(h => {
    const streak = calculateStreak(h);
    const streakLabel = `${streak} ${h.frequency === "weekly" ? "weeks" : "days"}`;
    const completedToday = h.completedDates.some(d => d.startsWith(todayStr));
    const btnClass = completedToday ? "action-btn completed-btn" : "action-btn complete-btn";
    const btnText = completedToday ? "completed" : "complete";

    html += `
      <tr data-id="${h.id}">
        <td>${h.name}</td>
        <td>${h.frequency}</td>
        <td>${streakLabel}</td>
        <td>
          <button class="action-btn view-btn">view</button>
          <button class="${btnClass}">${btnText}</button>
        </td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  container.querySelectorAll("tr[data-id]").forEach(row => {
    const id = row.getAttribute("data-id")!;
    row.querySelector<HTMLButtonElement>(".view-btn")?.addEventListener("click", () => onView(id));
    // both complete-btn and completed-btn call same toggle handler
    row.querySelector<HTMLButtonElement>(".complete-btn, .completed-btn")
      ?.addEventListener("click", () => onToggleComplete(id));
  });
}

export function renderStats(
  container: HTMLElement,
  total: number,
  completedToday: number
) {
  const rate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    container.innerHTML = `
    <h3>> stats</h3>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-value">${total}</div><div class="stat-label">total habits</div></div>
      <div class="stat-box"><div class="stat-value">${completedToday}</div><div class="stat-label">completed today</div></div>
      <div class="stat-box"><div class="stat-value">${rate}%</div><div class="stat-label">completion rate</div></div>
    </div>

    <h3>> progress</h3>
    <div id="habitHeatmap" class="heatmap-container"></div>`;

}

export function renderHabitDetail(
  container: HTMLElement,
  habit: Habit,
  onBack: () => void
) {
  container.innerHTML = `
    <div class="habit-detail">
      <h3>> ${habit.name}</h3>
      <p class="habit-description">${habit.description}</p>
      <p>frequency: ${habit.frequency}</p>
      <p>created: ${formatDate(new Date(habit.createdAt))}</p>
      <button id="backToHabits" class="action-btn">back to habits</button>
    </div>`;
  container.querySelector("#backToHabits")?.addEventListener("click", onBack);
}

export function showForm(
  habitList: HTMLElement,
  formEl: HTMLElement,
  habitStat: HTMLElement,
  addBtn: HTMLElement
) {
  habitList.classList.add("hidden");
  formEl.classList.remove("hidden");
  habitStat.classList.add("hidden");
  addBtn.classList.add("hidden");
}

export function hideForm(
  habitList: HTMLElement,
  formEl: HTMLElement,
  habitStat: HTMLElement,
  addBtn: HTMLElement
) {
  habitList.classList.remove("hidden");
  formEl.classList.add("hidden");
  habitStat.classList.remove("hidden");
  addBtn.classList.remove("hidden");
}

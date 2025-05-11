import { Habit } from "../../types.js";

let habits: Habit[] = [];

export function getAllHabits(): Habit[] {
  return habits;
}

export function loadHabits(): void {
  const saved = localStorage.getItem("habits");
  if (saved) {
    habits = JSON.parse(saved);
  } else {
    habits = [
      {
        id: "1",
        name: "do something",
        description: "doing something",
        frequency: "daily",
        completedDates: [new Date(Date.now() - 86400000).toISOString(), new Date().toISOString()],
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "2",
        name: "do something else",
        description: "stop",
        frequency: "weekly",
        completedDates: [new Date(Date.now() - 2 * 86400000).toISOString()],
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ];
    saveHabits();
  }
}

export function saveHabits(): void {
  localStorage.setItem("habits", JSON.stringify(habits));
}

export function addHabit(habit: Habit): void {
  habits.push(habit);
  saveHabits();
}

export function findHabitById(id: string): Habit | undefined {
  return habits.find(h => h.id === id);
}

export function markComplete(id: string, dateISO: string): void {
  const h = findHabitById(id);
  if (!h) return;
  if (!h.completedDates.some(d => d.startsWith(dateISO))) {
    h.completedDates.push(new Date(dateISO).toISOString());
    saveHabits();
  }
}

export function calculateStreak(habit: Habit): number {
  const freq = habit.frequency;
  const completionDates = habit.completedDates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completionDates.length === 0) return 0;

  const now = new Date();

  if (freq === "daily") {
    // must have completed today
    const todayStr = now.toISOString().slice(0, 10);
    if (!habit.completedDates.some(d => d.startsWith(todayStr))) {
      return 0;
    }
    let streak = 0;
    let checkDate = new Date(todayStr);
    for (const d of completionDates) {
      const dStr = d.toISOString().slice(0, 10);
      if (dStr === checkDate.toISOString().slice(0, 10)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;

  } else if (freq === "weekly") {
    function startOfWeek(d: Date) {
      const date = new Date(d);
      const day = date.getDay(); // Sun=0, Mon=1, … Sat=6
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    let streak = 0;
    for (let i = 0; ; i++) {
      const ref = new Date(now);
      ref.setDate(now.getDate() - i * 7);
      const weekStart = startOfWeek(ref);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const hit = completionDates.some(d => d >= weekStart && d <= weekEnd);
      if (hit) {
        streak++;
      } else {
        break;
      }
    }
    return streak;

  } else {
    // fallback: no streak
    return 0;
  }
}

export function toggleComplete(id: string): void {
  const habit = findHabitById(id);
  if (!habit) return;

  const today = new Date().toISOString().split("T")[0];
  const idx = habit.completedDates.findIndex(d => d.startsWith(today));

  if (idx >= 0) {
    habit.completedDates.splice(idx, 1);
  } else {
    habit.completedDates.push(new Date().toISOString());
  }

  saveHabits();
}

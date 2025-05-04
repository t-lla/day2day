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
  if (habit.completedDates.length === 0) return 0;
  const sorted = [...habit.completedDates]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 1;
  let cur = new Date(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i]);
    const diff = Math.floor((cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
      cur = prev;
    } else {
      break;
    }
  }
  return streak;
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

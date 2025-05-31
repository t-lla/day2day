import { storageService } from "../../services/storage.service.js";
import type { Habit } from "../../types.js";

let habits: Habit[] = [];

function loadHabits(): void {
  habits = storageService.get<Habit[]>("habits", []);
}

function saveHabits(): void {
  storageService.set("habits", habits);
}

export function initHabits(initial?: Habit[]): void {
  loadHabits();
  if (initial && initial.length > 0) {
    habits = initial;
    saveHabits();
    return;
  }
  if (habits.length === 0) {
    habits = [
      {
        id: "1",
        name: "Habit One",
        description: "Do something!",
        frequency: "daily",
        completedDates: [
          new Date(Date.now() - 86400000).toISOString(),
          new Date().toISOString(),
        ],
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "2",
        name: "Habit Two",
        description: "Stop doing something!",
        frequency: "weekly",
        completedDates: [
          new Date(Date.now() - 2 * 86400000).toISOString(),
        ],
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ];
    saveHabits();
  }
}

export function getAllHabits(): Habit[] {
  return habits;
}

export function addHabit(habit: Habit): void {
  habits.push(habit);
  saveHabits();
}

export function findHabitById(id: string): Habit | undefined {
  return habits.find((h) => h.id === id);
}

export function markComplete(id: string, dateISO: string): void {
  const h = findHabitById(id);
  if (!h) return;
  if (!h.completedDates.some((d) => d.startsWith(dateISO.split("T")[0]))) {
    h.completedDates.push(dateISO);
    h.streak = computeStreak(h.completedDates);
    saveHabits();
  }
}

export function removeCompletion(id: string, dateKey: string): void {
  const habit = findHabitById(id);
  if (!habit) return;

  let year: number, month: number, day: number;
  const parts = dateKey.split("-").map(Number);
  if (parts[0] > 1900) {
    [year, month, day] = parts;
  } else {
    [day, month, year] = parts;
  }

  habit.completedDates = habit.completedDates.filter((iso) => {
    const d = new Date(iso);
    return !(d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day);
  });
  habit.streak = computeStreak(habit.completedDates);
  saveHabits();
}

export function calculateStreak(habit: Habit): number {
  const freq = habit.frequency;
  const completionDates = habit.completedDates
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completionDates.length === 0) return 0;

  const now = new Date();
  if (freq === "daily") {
    const todayStr = now.toISOString().slice(0, 10);
    if (!habit.completedDates.some((d) => d.startsWith(todayStr))) {
      return 0;
    }
    let streak = 0;
    const checkDate = new Date(todayStr);
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
      const day = date.getDay();
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

      const hit = completionDates.some((d) => d >= weekStart && d <= weekEnd);
      if (hit) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  } else {
    return 0;
  }
}

export function toggleComplete(id: string): void {
  const habit = findHabitById(id);
  if (!habit) return;

  const today = new Date().toISOString().split("T")[0];
  const idx = habit.completedDates.findIndex((d) => d.startsWith(today));

  if (idx >= 0) {
    habit.completedDates.splice(idx, 1);
  } else {
    habit.completedDates.push(new Date().toISOString());
  }
  habit.streak = computeStreak(habit.completedDates);
  saveHabits();
}

/** ELIMINA un hábito completo del array y guarda los cambios localmente. */
export function deleteHabit(id: string): void {
  const index = habits.findIndex((h) => h.id === id);
  if (index >= 0) {
    habits.splice(index, 1);
    saveHabits();
  }
}

/** Devuelve si el hábito está marcado para la fecha (YYYY‑MM‑DD). */
export function isCompleted(id: string, dateISO: string): boolean {
  const h = findHabitById(id);
  if (!h) return false;
  return h.completedDates.some((d) => d.startsWith(dateISO));
}

/** Devuelve racha de días consecutivos (modo diario) terminando hoy. */
function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;

  const uniq = Array.from(new Set(dates.map(d => d.slice(0, 10)))).sort().reverse();

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const iso of uniq) {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);

    const diff = (today.getTime() - d.getTime()) / 86_400_000; // días
    if (diff === streak) {
      streak++;     // día consecutivo
    } else {
      break;        // se rompió la cadena
    }
  }
  return streak;
}
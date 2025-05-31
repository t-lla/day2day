import * as habitModel from "../components/habits/habits.model.js";
import { syncService } from "../services/sync.service.js";
import { Habit } from "../types.js";

const model: any = habitModel;

const originalAddHabit = model.addHabit as (h: Habit) => void;
model.addHabit = (habit: Habit): void => {
  originalAddHabit(habit);
  syncService.queueOperation({ type: "create", entity: "habit", data: habit });
};

const originalSaveHabits = model.saveHabits as (h: Habit[]) => void;
model.saveHabits = (habits: Habit[]): void => {
  originalSaveHabits(habits);
  syncService.queueOperation({ type: "update", entity: "habit", data: habits });
};
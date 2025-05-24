/**
 * @packageDocumentation
 * @module HabitsController
 *
 * Controller responsible for managing habits: loading, creating,
 * toggling completion, viewing details, and rendering stats.
 * Acts as intermediary between habits.model for data persistence
 * and habits.view for UI rendering.
 */
import { loadComponent } from "../loader.js";
import * as model from "./habits.model.js";
import * as view from "./habits.view.js";
import type { Habit } from "../../types.js";
import * as heatmap from "../../heatmap.js";

/** Controls habit-related functionality and UI updates. */
export class HabitsController {
  private addBtn!: HTMLElement;
  private cancelBtn!: HTMLElement;
  private formEl!: HTMLFormElement;
  private habitList!: HTMLElement;
  private habitStat!: HTMLElement;

  /**
   * Initializes the view, loads data, and binds UI event listeners.
   * 
   * @param selector - CSS selector for the container to render habits into.
   */
  async init(selector: string): Promise<void> {
    await loadComponent(selector, "../../components/habits.html");

    this.addBtn = document.getElementById("addHabitBtn")!;
    this.cancelBtn = document.getElementById("cancelHabitBtn")!;
    this.formEl = document.getElementById("habitForm") as HTMLFormElement;
    this.habitList = document.getElementById("habitsList")!;
    this.habitStat = document.getElementById("habitStats")!;

    model.loadHabits();
    this.renderList();

    this.addBtn.addEventListener("click", () => {
      view.showForm(
        this.habitList,
        document.getElementById("habitFormContainer")!,
        this.habitStat,
        this.addBtn
      );
    });

    this.cancelBtn.addEventListener("click", () => {
      this.formEl.reset();
      view.hideForm(
        this.habitList,
        document.getElementById("habitFormContainer")!,
        this.habitStat,
        this.addBtn
      );
    });

    this.formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("habitName") as HTMLInputElement).value;
      const description = (document.getElementById("habitDescription") as HTMLTextAreaElement).value;
      const frequency = (document.getElementById("habitFrequency") as HTMLSelectElement).value as Habit["frequency"];

      const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        description,
        frequency,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };

      model.addHabit(newHabit);
      this.formEl.reset();
      view.hideForm(
        this.habitList,
        document.getElementById("habitFormContainer")!,
        this.habitStat,
        this.addBtn
      );
      this.renderList();
    });
  }

  /** Renders the habits list and stats. */
  private renderList(): void {
    const all = model.getAllHabits();
    const todayStr = new Date().toISOString().split("T")[0];
    const completedCount = all.filter(h => h.completedDates.some(d => d.startsWith(todayStr))).length;

    view.renderHabitsList(
      this.habitList,
      all,
      this.handleView.bind(this),
      this.handleToggleComplete.bind(this)
    );

    view.renderStats(this.habitStat, all.length, completedCount);
    
    const heatmapEl = document.getElementById("habitHeatmap");
    if (heatmapEl) {
      heatmap.renderHeatmap(heatmapEl, all);
    }
  }

  /**
   * Handler for viewing details of a habit.
   * 
   * @param id - The identifier of the habit.
   */
  private handleView(id: string): void {
    const habit = model.findHabitById(id);
    if (!habit) return;

    view.renderHabitDetail(
      this.habitList,
      habit,
      this.renderList.bind(this)
    );
  }

  /**
   * Handler for toggling today's completion status of a habit.
   * Adds today if missing, removes if already present.
   * 
   * @param id - The identifier of the habit.
   */
  private handleToggleComplete(id: string): void {
    model.toggleComplete(id);
    document.dispatchEvent(new CustomEvent("habitCompletionChanged", { detail: { habitId: id } }));
    this.renderList();
  }
}

/** Singleton instance and initializer for the Habits feature. */
let habitsController: HabitsController | null = null;

/**
 * Initializes the HabitsController (if not already created) and renders into the given container.
 * 
 * @returns A promise that resolves when initialization is complete.
 */
export function initHabits(): Promise<void> {
  if (!habitsController) {
    habitsController = new HabitsController();
  }
  return habitsController.init("#content");
}

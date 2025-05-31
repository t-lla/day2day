import { loadComponent } from "../loader.js";
import * as model from "./habits.model.js";
import * as view from "./habits.view.js";
import type { Habit } from "../../types.js";
import * as heatmap from "../../heatmap.js";
import { apiService } from "../../services/api.service.js";
import { syncService } from "../../services/sync.service.js";

export class HabitsController {
  private addBtn!: HTMLElement;
  private cancelBtn!: HTMLElement;
  private formEl!: HTMLFormElement;
  private habitList!: HTMLElement;
  private habitStat!: HTMLElement;

  async init(selector: string): Promise<void> {
    await loadComponent(selector, "../../components/habits.html");

    if (apiService.isAuthenticated()) {
      const res = await apiService.getHabits();
      if (res.data) {
        model.initHabits(res.data);
      } else {
        model.initHabits();
      }
    } else {
      model.initHabits();
    }

    this.addBtn = document.getElementById("addHabitBtn")!;
    this.cancelBtn = document.getElementById("cancelHabitBtn")!;
    this.formEl = document.getElementById("habitForm") as HTMLFormElement;
    this.habitList = document.getElementById("habitsList")!;
    this.habitStat = document.getElementById("habitStats")!;

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

    this.formEl.addEventListener("submit", async (e) => {
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

      if (apiService.isAuthenticated()) {
        const res = await apiService.createHabit({
          name:        newHabit.name,
          description: newHabit.description,
          frequency:   newHabit.frequency,
        });
        if (res.data) {
          model.addHabit(res.data);
        } else {
          console.error("Error al crear hábito:", res.error);
          alert("No se pudo guardar el hábito en el servidor.");
        }
      } else {
        model.addHabit(newHabit);
      }

      this.formEl.reset();
      view.hideForm(
        this.habitList,
        document.getElementById("habitFormContainer")!,
        this.habitStat,
        this.addBtn
      );
      this.renderList();
      document.addEventListener("habits-updated", () => this.renderList());
    });
  }

  /** Renders the habits list y stats. */
  private renderList(): void {
    const all = model.getAllHabits();
    const todayStr = new Date().toISOString().split("T")[0];
    const completedCount = all.filter(h => h.completedDates.some(d => d.startsWith(todayStr))).length;

    view.renderHabitsList(
      this.habitList,
      all,
      this.handleView.bind(this),
      this.handleToggleComplete.bind(this),
      this.handleDelete.bind(this) // ← Aquí debe existir handleDelete
    );

    view.renderStats(this.habitStat, all.length, completedCount);

    const heatmapEl = document.getElementById("habitHeatmap");
    if (heatmapEl) {
      heatmap.renderHeatmap(heatmapEl, all);
    }
  }

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
   * Reemplazamos el antiguo toggle por este que llama a la API.
   */
  private async handleToggleComplete(id: string): Promise<void> {

    const habit = model.findHabitById(id);
    if (!habit) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const alreadyDone = habit.completedDates.some((d) => d.startsWith(todayStr));

    if (apiService.isAuthenticated()) {
      if (alreadyDone) {

        const res = await apiService.uncompleteHabit(id, todayStr);
        if (res.status === 200 && res.data?.success) {
          model.removeCompletion(id, todayStr);
        } else {
          alert("Error al desmarcar hábito en el servidor");
          return;
        }
      } else {

        const res = await apiService.completeHabit(id, todayStr);
        if (res.status === 200 && res.data?.success) {
          model.markComplete(id, res.data.completion_date);
        } else {
          alert("Error al marcar hábito en el servidor");
          return;
        }
      }
    } else {

      model.toggleComplete(id);
      syncService.queueOperation({
        type: alreadyDone ? "delete" : "create",
        entity: "habit",
        data: { id, date: todayStr },
      });
    }

    this.renderList();
  }

  private async handleDelete(id: string): Promise<void> {
    const confirmDelete = confirm("¿Estás seguro/a de que quieres eliminar este hábito?");
    if (!confirmDelete) return;

    if (apiService.isAuthenticated()) {
      const res = await apiService.deleteHabit(id);
      if (!res.data) {
        console.error("Error al borrar hábito en el servidor:", res.error);
        alert("No se pudo eliminar el hábito en el servidor.");
        return;
      }
    }

    model.deleteHabit(id);

    syncService.queueOperation({
      type: "delete",
      entity: "habit",
      data: { id },
    });

    this.renderList();
  }
}

let habitsController: HabitsController | null = null;

export function initHabits(): Promise<void> {
  if (!habitsController) {
    habitsController = new HabitsController();
  }
  return habitsController.init("#content");
}

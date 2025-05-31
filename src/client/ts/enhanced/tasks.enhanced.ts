import { TasksController } from "../components/tasks/tasks.controller.js"
import { syncService } from "../services/sync.service.js"

export class TasksEnhanced extends TasksController {
  async init(selector: string): Promise<void> {
    await super.init(selector)
    this.setupSyncHooks()
  }

  private setupSyncHooks(): void {
    const originalSaveTask = this.saveTask

    this.saveTask = async (): Promise<void> => {

      await originalSaveTask.call(this)

      syncService.queueOperation({
        type: "update",
        entity: "task",
        data: this.tasks,
      })
    }
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common";
import { TasksService } from "./tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Query("userId") userId: string) {
    return this.tasksService.findAllByUser(Number(userId));
  }

  @Post()
  async createTask(@Body() body: {
    userId: number;
    title: string;
    description: string | null;
    dueDate: string | null;
    priority: "low" | "medium" | "high";
  }) {
    return this.tasksService.create(
      body.userId,
      {
        title:       body.title,
        description: body.description,
        dueDate:     body.dueDate,
        priority:    body.priority,
      }
    );
  }

  /**
   * ← Nuevo endpoint para actualizar (editar) una tarea.
   * El body debe incluir userId + todos los campos de la tarea, incluso el `completed`.
   */
  @Put(":id")
  async updateTask(
    @Param("id") id: string,
    @Body() body: {
      userId: number;
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: "low" | "medium" | "high";
      completed: boolean;
    }
  ) {
    return this.tasksService.updateTask(
      body.userId,
      Number.parseInt(id),
      {
        title:       body.title,
        description: body.description,
        dueDate:     body.dueDate,
        priority:    body.priority,
        completed:   body.completed,
      }
    );
  }

  @Delete(":id")
  async deleteTask(
    @Param("id") id: string,
    @Query("userId") userId: string
  ) {
    await this.tasksService.delete(
      Number.parseInt(userId),
      Number.parseInt(id)
    );
    return { success: true };
  }

  @Post("sync")
  async syncTasks(@Body() body: { userId: number; tasks: any[] }) {
    return this.tasksService.syncTasks(body.userId, body.tasks);
  }
}

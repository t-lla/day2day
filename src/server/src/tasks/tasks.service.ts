import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "./task.entity";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async findAllByUser(userId: number): Promise<any[]> {
    const tasks = await this.tasksRepository.find({
      where: { user_id: userId },
    });

    return tasks.map((t) => ({
      id:          t.task_id.toString(),
      title:       t.title,
      description: t.description,
      dueDate:     t.due_date ? t.due_date.toISOString().split("T")[0] : null,
      priority:    t.priority as "low" | "medium" | "high",
      completed:   t.status === "completed",
      createdAt:   t.created_at.toISOString(),
    }));
  }

  async create(
    userId: number,
    taskData: {
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: "low" | "medium" | "high";
    },
  ): Promise<any> {
    const entity = this.tasksRepository.create({
      user_id:     userId,
      title:       taskData.title,
      description: taskData.description,
      due_date:    taskData.dueDate ? new Date(taskData.dueDate) : null,
      priority:    taskData.priority,
      status:      "active", // por defecto nueva tarea está “active”
      completed_at: null,
    });

    const saved = await this.tasksRepository.save(entity);

    return {
      id:          saved.task_id.toString(),
      title:       saved.title,
      description: saved.description,
      dueDate:     saved.due_date ? saved.due_date.toISOString().split("T")[0] : null,
      priority:    saved.priority as "low" | "medium" | "high",
      completed:   saved.status === "completed",
      createdAt:   saved.created_at.toISOString(),
    };
  }

  /**
   * ← Nuevo método para actualizar (editar) una tarea existente,
   * incluyendo el cambio en `status` y `completed_at`.
   */
  async updateTask(
    userId: number,
    taskId: number,
    taskData: {
      title: string;
      description: string | null;
      dueDate: string | null;
      priority: "low" | "medium" | "high";
      completed: boolean;
    },
  ): Promise<any> {

    const existing = await this.tasksRepository.findOne({
      where: { task_id: taskId, user_id: userId },
    });
    if (!existing) {
      throw new Error("Task not found");
    }

    existing.title       = taskData.title;
    existing.description = taskData.description;
    existing.due_date    = taskData.dueDate ? new Date(taskData.dueDate) : null;
    existing.priority    = taskData.priority;
    existing.status      = taskData.completed ? "completed" : "active";
    existing.completed_at = taskData.completed ? new Date() : null;

    const saved = await this.tasksRepository.save(existing);

    return {
      id:          saved.task_id.toString(),
      title:       saved.title,
      description: saved.description,
      dueDate:     saved.due_date ? saved.due_date.toISOString().split("T")[0] : null,
      priority:    saved.priority as "low" | "medium" | "high",
      completed:   saved.status === "completed",
      createdAt:   saved.created_at.toISOString(),
    };
  }

  async delete(userId: number, taskId: number): Promise<void> {

    await this.tasksRepository.delete({ user_id: userId, task_id: taskId });
  }

  async syncTasks(userId: number, tasks: any[]): Promise<any[]> {

    await this.tasksRepository.delete({ user_id: userId });

    const savedTasks: any[] = [];
    for (const t of tasks) {
      const newTask = this.tasksRepository.create({
        user_id:     userId,
        title:       t.title,
        description: t.description,
        due_date:    t.dueDate ? new Date(t.dueDate) : null,
        priority:    t.priority,
        status:      t.completed ? "completed" : "active",
        completed_at: t.completed ? new Date() : null,
      });
      const saved = await this.tasksRepository.save(newTask);

      savedTasks.push({
        id:          saved.task_id.toString(),
        title:       saved.title,
        description: saved.description,
        dueDate:     saved.due_date ? saved.due_date.toISOString().split("T")[0] : null,
        priority:    saved.priority as "low" | "medium" | "high",
        completed:   saved.status === "completed",
        createdAt:   saved.created_at.toISOString(),
      });
    }
    return savedTasks;
  }
}

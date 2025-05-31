import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode } from "@nestjs/common";
import { HabitsService } from "./habits.service";

@Controller("habits")
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  async getHabits(@Query('userId') userId: string) {
    return this.habitsService.findAllByUser(Number(userId));
  }

  @Post()
  async createHabit(@Body() body: {
    userId: number;
    name: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }) {
    return this.habitsService.create(body.userId, {
      name: body.name,
      description: body.description,
      frequency: body.frequency,
    });
  }

  @Post('sync')
  async syncHabits(@Body() body: { userId: number; habits: any[] }) {
    return this.habitsService.syncHabits(body.userId, body.habits);
  }

  @Post(":id/complete")
  @HttpCode(200)
  async markComplete(
    @Param("id") id: string,
    @Body() body: { userId: number; date: string },
  ) {
    const log = await this.habitsService.markComplete(
      body.userId,
      Number(id),
      new Date(body.date),
    );

    return {
      success: true,
      log_id: log.log_id,
      completion_date: body.date,
    };
  }

  @Delete(":id/complete")
  @HttpCode(200)
  async unmarkComplete(
    @Param("id") id: string,
    @Body() body: { userId: number; date: string },
  ) {
    await this.habitsService.removeCompletion(
      body.userId,
      Number(id),
      new Date(body.date),
    );

    return { success: true };
  }

  @Delete(":id")
  async deleteHabit(
    @Param("id") id: string,
    @Body() body: { userId: number }
  ) {
    await this.habitsService.deleteHabit(body.userId, Number.parseInt(id));
    return { success: true };
  }
}

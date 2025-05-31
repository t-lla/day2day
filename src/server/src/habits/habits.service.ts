import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from './habit.entity';
import { HabitLog } from './habit-log.entity';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitsRepository: Repository<Habit>,

    @InjectRepository(HabitLog)
    private readonly habitLogsRepository: Repository<HabitLog>,
  ) {}

  async findAllByUser(userId: number): Promise<any[]> {
    const habits = await this.habitsRepository.find({
      where: { user_id: userId },
      relations: ["logs"],
    });

    return habits.map((h) => ({
      id: h.habit_id.toString(),
      name: h.name,
      description: h.description,
      frequency: h.frequency,

      completedDates: h.logs.map((log) => {
        const d = log.completion_date instanceof Date
          ? log.completion_date
          : new Date(log.completion_date);
        return d.toISOString().split("T")[0];
      }),
      createdAt:
        h.created_at instanceof Date
          ? h.created_at.toISOString()
          : new Date(h.created_at).toISOString(),
    }));
  }

  async create(
    userId: number,
    habitData: {
      name: string;
      description: string;
      frequency: "daily" | "weekly" | "monthly";
    },
  ): Promise<any> {
    const habit = this.habitsRepository.create({
      user_id: userId,
      name: habitData.name,
      description: habitData.description,
      frequency: habitData.frequency,
    });

    const saved = await this.habitsRepository.save(habit);

    return {
      id: saved.habit_id.toString(),
      name: saved.name,
      description: saved.description,
      frequency: saved.frequency,
      completedDates: [],
      createdAt: saved.created_at.toISOString(),
    };
  }

  async markComplete(
    userId: number,
    habitId: number,
    date: Date,
  ): Promise<HabitLog> {
    const dayOnly = new Date(date);
    dayOnly.setHours(0, 0, 0, 0);

    let log = await this.habitLogsRepository.findOne({
      where: {
        habit_id: habitId,
        user_id: userId,
        completion_date: dayOnly,
      },
    });

    if (!log) {
      log = this.habitLogsRepository.create({
        habit_id: habitId,
        user_id: userId,
        completion_date: dayOnly,
      });
      log = await this.habitLogsRepository.save(log);
    }

    return log;
  }

  async removeCompletion(userId: number, habitId: number, date: Date): Promise<void> {
    const dayOnly = new Date(date);
    dayOnly.setHours(0, 0, 0, 0);

    await this.habitLogsRepository.delete({
      habit_id: habitId,
      user_id: userId,
      completion_date: dayOnly,
    });
  }

  async syncHabits(userId: number, habits: any[]): Promise<any[]> {

    await this.habitLogsRepository.delete({ user_id: userId });
    await this.habitsRepository.delete({ user_id: userId });

    const savedHabits = [];

    for (const habit of habits) {
      const newHabit = this.habitsRepository.create({
        user_id: userId,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
      });

      const saved = await this.habitsRepository.save(newHabit);

      for (const dateStr of habit.completedDates) {
        const log = this.habitLogsRepository.create({
          habit_id: saved.habit_id,
          user_id: userId,
          completion_date: new Date(dateStr),
        });
        await this.habitLogsRepository.save(log);
      }

      savedHabits.push({
        id: saved.habit_id.toString(),
        name: saved.name,
        description: saved.description,
        frequency: saved.frequency,
        completedDates: habit.completedDates,
        createdAt: saved.created_at.toISOString(),
      });
    }

    return savedHabits;
  }

  /** ELIMINA un hábito *y* todos sus logs asociados. */
  async deleteHabit(userId: number, habitId: number): Promise<void> {

    await this.habitLogsRepository.delete({
      habit_id: habitId,
      user_id: userId,
    });

    await this.habitsRepository.delete({
      habit_id: habitId,
      user_id: userId,
    });
  }
}

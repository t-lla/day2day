import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Habit } from './habit.entity';
import { User } from '../users/user.entity';

@Entity('habitlogs')
export class HabitLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column()
  habit_id: number;

  @Column()
  user_id: number;

  @Column('date')
  completion_date: Date;

  @ManyToOne(() => Habit, (h) => h.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habit_id' })
  habit: Habit;

  @ManyToOne(() => User, (u) => u.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

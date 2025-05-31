import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { HabitLog } from './habit-log.entity';

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn() habit_id: number;
  @Column() user_id: number;
  @Column() name: string;
  @Column('text', { nullable: true }) description: string | null;
  @Column({ type: 'enum', enum: ['daily', 'weekly', 'monthly'] })
  frequency: 'daily' | 'weekly' | 'monthly';

  @CreateDateColumn() created_at: Date;

  @ManyToOne(() => User, (u) => u.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => HabitLog, (l) => l.habit)
  logs: HabitLog[];
}

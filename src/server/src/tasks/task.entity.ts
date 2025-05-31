import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  task_id: number;

  @Column()
  user_id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('date', { nullable: true })
  due_date: Date | null;

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Column({ type: 'enum', enum: ['active', 'completed'], default: 'active' })
  status: 'active' | 'completed';

  @Column('datetime', { nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()  created_at: Date;
  @UpdateDateColumn()  updated_at: Date;

  @ManyToOne(() => User, (u) => u.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany,
  JoinTable, CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from './tag.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  note_id: number;

  @Column() user_id: number;
  @Column() title: string;
  @Column('text', { nullable: true }) content: string | null;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;

  @ManyToOne(() => User, (u) => u.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable({
    name: 'NoteTags',
    joinColumn: { name: 'note_id', referencedColumnName: 'note_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' },
  })
  tags: Tag[];
}

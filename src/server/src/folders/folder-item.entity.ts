import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, Unique, Index,
} from 'typeorm';
import { Folder } from './folder.entity';

@Entity('folderitems')
export class FolderItem {
  @PrimaryGeneratedColumn({ name: 'folder_item_id' })
  folderItemId: number

  @Column({ name: 'folder_id' })
  folderId: number

  @Column({ name: 'item_id' })
  itemId: number

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: ['habit', 'note', 'task', 'transaction'],
  })
  itemType: 'habit' | 'note' | 'task' | 'transaction'

  @ManyToOne(() => Folder, (folder) => folder.items)
  @JoinColumn({ name: 'folder_id' })
  folder: Folder
}

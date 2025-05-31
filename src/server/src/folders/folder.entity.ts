import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { User } from "../users/user.entity"
import { FolderItem } from "./folder-item.entity"

@Entity("folders")
export class Folder {
  @PrimaryGeneratedColumn()
  folder_id: number

  @Column()
  user_id: number

  @Column()
  name: string

  @Column({ length: 7, nullable: true })
  color: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(
    () => User,
    (user) => user.folders,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @OneToMany(
    () => FolderItem,
    (item) => item.folder,
  )
  items: FolderItem[]
}

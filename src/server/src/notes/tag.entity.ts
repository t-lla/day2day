import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Note } from "./note.entity"

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id: number

  @Column()
  user_id: number

  @Column()
  name: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToMany(
    () => Note,
    (note) => note.tags,
  )
  notes: Note[]
}

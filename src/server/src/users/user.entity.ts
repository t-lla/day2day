import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Habit } from "../habits/habit.entity"
import { Note } from "../notes/note.entity"
import { Task } from "../tasks/task.entity"
import { Account } from "../finances/account.entity"
import { Category } from "../finances/category.entity"
import { Transaction } from "../finances/transaction.entity"
import { Budget } from "../finances/budget.entity"
import { Folder } from "../folders/folder.entity"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  user_id: number

  @Column({ unique: true })
  username: string

  @Column({ unique: true })
  email: string

  @Column()
  password_hash: string

  @Column({ nullable: true })
  name: string

  @Column({ default: "dark" })
  theme: string

  @CreateDateColumn()
  created_at: Date

  @OneToMany(
    () => Habit,
    (habit) => habit.user,
  )
  habits: Habit[]

  @OneToMany(
    () => Note,
    (note) => note.user,
  )
  notes: Note[]

  @OneToMany(
    () => Task,
    (task) => task.user,
  )
  tasks: Task[]

  @OneToMany(
    () => Account,
    (account) => account.user,
  )
  accounts: Account[]

  @OneToMany(
    () => Category,
    (category) => category.user,
  )
  categories: Category[]

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.user,
  )
  transactions: Transaction[]

  @OneToMany(
    () => Budget,
    (budget) => budget.user,
  )
  budgets: Budget[]

  @OneToMany(
    () => Folder,
    (folder) => folder.user,
  )
  folders: Folder[]
}
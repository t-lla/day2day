import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Transaction } from "./transaction.entity"
import { Budget } from "./budget.entity"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number

  @Column()
  user_id: number

  @Column()
  name: string

  @Column({ length: 7, nullable: true })
  color: string

  @Column({ type: "enum", enum: ["income", "expense"] })
  type: "income" | "expense"

  @Column({ default: false })
  is_fixed: boolean

  @Column("decimal", { precision: 15, scale: 2, nullable: true })
  monthly_budget: number

  @ManyToOne(
    () => User,
    (user) => user.categories,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.category,
  )
  transactions: Transaction[]

  @OneToMany(
    () => Budget,
    (budget) => budget.category,
  )
  budgets: Budget[]
}

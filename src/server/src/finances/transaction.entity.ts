import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Account } from "./account.entity"
import { Category } from "./category.entity"

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn()
  transaction_id: number

  @Column()
  user_id: number

  @Column()
  description: string

  @Column()
  original_account_id: number

  @Column({ nullable: true })
  final_account_id: number

  @Column({ nullable: true })
  category_id: number

  @Column("decimal", { precision: 15, scale: 2 })
  amount: number

  @Column({ type: "enum", enum: ["income", "expense", "transfer"] })
  type: "income" | "expense" | "transfer"

  @Column({ default: false })
  is_recurring: boolean

  @Column({ type: "enum", enum: ["weekly", "monthly", "yearly"], nullable: true })
  recurring_frequency: "weekly" | "monthly" | "yearly"

  @Column("date")
  transaction_date: Date

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(
    () => User,
    (user) => user.transactions,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(
    () => Account,
    (account) => account.outgoingTransactions,
  )
  @JoinColumn({ name: "original_account_id" })
  originalAccount: Account

  @ManyToOne(
    () => Account,
    (account) => account.incomingTransactions,
  )
  @JoinColumn({ name: "final_account_id" })
  finalAccount: Account

  @ManyToOne(
    () => Category,
    (category) => category.transactions,
  )
  @JoinColumn({ name: "category_id" })
  category: Category
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Transaction } from "./transaction.entity"

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn()
  account_id: number

  @Column()
  user_id: number

  @Column()
  name: string

  @Column({ type: "enum", enum: ["credit", "debit", "savings", "cash", "investment"] })
  type: "credit" | "debit" | "savings" | "cash" | "investment"

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  balance: number

  @Column({ length: 3 })
  currency: string

  @Column({ length: 7, nullable: true })
  color: string

  @Column({ default: false })
  is_default: boolean

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(
    () => User,
    (user) => user.accounts,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.originalAccount,
  )
  outgoingTransactions: Transaction[]

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.finalAccount,
  )
  incomingTransactions: Transaction[]
}

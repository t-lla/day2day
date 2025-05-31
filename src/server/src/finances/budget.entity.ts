import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../users/user.entity"
import { Category } from "./category.entity"

@Entity("budgets")
export class Budget {
  @PrimaryGeneratedColumn()
  budget_id: number

  @Column()
  user_id: number

  @Column()
  category_id: number

  @Column("tinyint")
  month: number

  @Column("smallint")
  year: number

  @Column("decimal", { precision: 15, scale: 2 })
  amount: number

  @ManyToOne(
    () => User,
    (user) => user.budgets,
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(
    () => Category,
    (category) => category.budgets,
  )
  @JoinColumn({ name: "category_id" })
  category: Category
}

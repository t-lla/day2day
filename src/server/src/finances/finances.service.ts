import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Budget } from "./budget.entity";
import { Category } from "./category.entity";
import { Account } from "./account.entity";
import { Transaction } from "./transaction.entity";

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>
  ) {}

  async getAccounts(userId: number): Promise<any[]> {
    const accounts = await this.accountsRepository.find({
      where: { user_id: userId },
    });

    return accounts.map((account) => ({
      id: account.account_id.toString(),
      name: account.name,
      type: account.type,
      balance: Number.parseFloat(account.balance.toString()),
      currency: account.currency,
      color: account.color,
      isDefault: account.is_default,
    }));
  }

  async createAccount(userId: number, accountData: any): Promise<any> {
    const account = this.accountsRepository.create({
      user_id: userId,
      name: accountData.name,
      type: accountData.type,
      balance: accountData.balance,
      currency: accountData.currency,
      color: accountData.color,
      is_default: accountData.isDefault,
    });
    const saved = await this.accountsRepository.save(account);

    return {
      id: saved.account_id.toString(),
      name: saved.name,
      type: saved.type,
      balance: Number.parseFloat(saved.balance.toString()),
      currency: saved.currency,
      color: saved.color,
      isDefault: saved.is_default,
    };
  }

  async getCategories(userId: number): Promise<any[]> {
    const categories = await this.categoriesRepository.find({
      where: { user_id: userId },
    });
    return categories.map((category) => ({
      id: category.category_id.toString(),
      name: category.name,
      type: category.type,
      color: category.color,
      isFixed: category.is_fixed,
      monthlyBudget: category.monthly_budget
        ? Number.parseFloat(category.monthly_budget.toString())
        : undefined,
    }));
  }

  async createCategory(userId: number, categoryData: any): Promise<any> {
    const category = this.categoriesRepository.create({
      user_id: userId,
      name: categoryData.name,
      type: categoryData.type,
      color: categoryData.color,
      is_fixed: categoryData.isFixed,
      monthly_budget: categoryData.monthlyBudget,
    });
    const saved = await this.categoriesRepository.save(category);
    return {
      id: saved.category_id.toString(),
      name: saved.name,
      type: saved.type,
      color: saved.color,
      isFixed: saved.is_fixed,
      monthlyBudget: saved.monthly_budget
        ? Number.parseFloat(saved.monthly_budget.toString())
        : undefined,
    };
  }

  async getTransactions(userId: number): Promise<any[]> {
    const transactions = await this.transactionsRepository.find({
      where: { user_id: userId },
      relations: ["category"],
      order: { transaction_date: "DESC" },
    });
    return transactions.map((transaction) => ({
      id: transaction.transaction_id.toString(),
      date: transaction.transaction_date.toISOString(),
      description: transaction.description,
      amount: Number.parseFloat(transaction.amount.toString()),
      type: transaction.type,
      categoryId: transaction.category_id?.toString(),
      accountId: transaction.original_account_id.toString(),
      toAccountId: transaction.final_account_id?.toString(),
      isRecurring: transaction.is_recurring,
      recurringFrequency: transaction.recurring_frequency,
    }));
  }

  async createTransaction(
    userId: number,
    transactionData: any
  ): Promise<any> {

    if (isNaN(userId)) {
      throw new BadRequestException("userId inválido en createTransaction service");
    }

    const {
      description,
      accountId,
      toAccountId,
      categoryId,
      amount,
      type,
      date,
      isRecurring,
      recurringFrequency,
    } = transactionData;

    if (!description || !accountId || amount == null || !type || !date) {
      throw new BadRequestException(
        "Campos faltantes o inválidos para crear transacción (description, accountId, amount, type, date)"
      );
    }

    const originalAccountId = Number.parseInt(accountId.toString());
    if (isNaN(originalAccountId)) {
      throw new BadRequestException("accountId inválido");
    }

    let finalAccountId: number | null = null;
    if (toAccountId !== undefined && toAccountId !== null && toAccountId !== "") {
      finalAccountId = Number.parseInt(toAccountId.toString());
      if (isNaN(finalAccountId)) {
        throw new BadRequestException("toAccountId inválido");
      }
    }

    let parsedCategoryId: number | null = null;
    if (
      categoryId !== undefined &&
      categoryId !== null &&
      categoryId !== ""
    ) {
      parsedCategoryId = Number.parseInt(categoryId.toString());
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestException("categoryId inválido");
      }
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) {
      throw new BadRequestException("amount inválido");
    }

    if (
      type !== "income" &&
      type !== "expense" &&
      type !== "transfer"
    ) {
      throw new BadRequestException("type inválido");
    }

    const fecha = new Date(date);
    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
      throw new BadRequestException("date inválida");
    }

    const recurringBool = !!isRecurring;
    let parsedFreq: "weekly" | "monthly" | "yearly" | null = null;
    if (recurringBool) {
      if (
        recurringFrequency !== "weekly" &&
        recurringFrequency !== "monthly" &&
        recurringFrequency !== "yearly"
      ) {
        throw new BadRequestException("recurringFrequency inválido");
      }
      parsedFreq = recurringFrequency;
    }

    const transactionEntity = this.transactionsRepository.create({
      user_id: userId,
      description: description,
      original_account_id: originalAccountId,
      final_account_id: finalAccountId,
      category_id: parsedCategoryId,
      amount: parsedAmount,
      type: type,
      is_recurring: recurringBool,
      recurring_frequency: parsedFreq,
      transaction_date: fecha,
    });

    const saved = await this.transactionsRepository.save(transactionEntity);

    return {
      id: saved.transaction_id.toString(),
      date: saved.transaction_date.toISOString(),
      description: saved.description,
      amount: Number.parseFloat(saved.amount.toString()),
      type: saved.type,
      categoryId: saved.category_id?.toString(),
      accountId: saved.original_account_id.toString(),
      toAccountId: saved.final_account_id?.toString(),
      isRecurring: saved.is_recurring,
      recurringFrequency: saved.recurring_frequency,
    };
  }

  async syncFinances(
    userId: number,
    data: {
      accounts: any[];
      categories: any[];
      transactions: any[];
      budgets: any[];
    }
  ): Promise<any> {

    await this.budgetsRepository.delete({ user_id: userId });
    await this.transactionsRepository.delete({ user_id: userId });
    await this.categoriesRepository.delete({ user_id: userId });
    await this.accountsRepository.delete({ user_id: userId });

    const result = {
      accounts: [],
      categories: [],
      transactions: [],
      budgets: [],
    };

    for (const accountData of data.accounts) {
      const account = await this.createAccount(userId, accountData);
      result.accounts.push(account);
    }

    for (const categoryData of data.categories) {
      const category = await this.createCategory(userId, categoryData);
      result.categories.push(category);
    }

    for (const transactionData of data.transactions) {
      const transaction = await this.createTransaction(userId, transactionData);
      result.transactions.push(transaction);
    }

    return result;
  }
}

import { Controller, Get, Post, Body, Query } from "@nestjs/common"
import { FinancesService } from "./finances.service"

@Controller("finances")
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get("accounts")
  async getAccounts(@Query('userId') userId: string) {
    return this.financesService.getAccounts(Number(userId))
  }

  @Post('accounts')
  async createAccount(@Body() body: { userId: number; [key: string]: any }) {
    return this.financesService.createAccount(body.userId, body);
  }

  @Get("categories")
  async getCategories(@Query('userId') userId: string) {
    return this.financesService.getCategories(Number(userId))
  }

  @Post('categories')
  async createCategory(@Body() body: { userId: number; [key: string]: any }) {
    return this.financesService.createCategory(body.userId, body);
  }

  @Get("transactions")
  async getTransactions(@Query('userId') userId: string) {
    return this.financesService.getTransactions(Number(userId))
  }

  @Post('transactions')
  async createTransaction(@Body() body: { userId: number; [key: string]: any }) {
    return this.financesService.createTransaction(body.userId, body);
  }

  @Post('sync')
  async syncFinances(@Body() body: {
    userId: number;
    accounts: any[];
    categories: any[];
    transactions: any[];
    budgets: any[];
  }) {
    return this.financesService.syncFinances(body.userId, {
      accounts: body.accounts,
      categories: body.categories,
      transactions: body.transactions,
      budgets: body.budgets,
    });
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from './account.entity';        // ← add
import { Category } from './category.entity';
import { Transaction } from './transaction.entity';// ← add
import { Budget } from './budget.entity';

import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Category,
      Transaction,
      Budget,
    ]),
    UsersModule,
  ],
  controllers: [FinancesController],
  providers: [FinancesService],
  exports: [FinancesService],
})
export class FinancesModule {}

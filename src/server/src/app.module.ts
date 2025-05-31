import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersModule } from "./users/users.module"
import { HabitsModule } from "./habits/habits.module"
import { NotesModule } from "./notes/notes.module"
import { TasksModule } from "./tasks/tasks.module"
import { FinancesModule } from "./finances/finances.module"
import { FoldersModule } from "./folders/folders.module"
import { RouterModule } from "@nestjs/core"
import { AuthModule } from "./auth/auth.module"

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || "user1",
      password: process.env.DB_PASSWORD || "user1",
      database: process.env.DB_DATABASE || "day2day",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: false,
      dropSchema: false,
      logging: true,
    }),
    UsersModule,
    RouterModule.register([
      { path: 'auth', module: UsersModule },
    ]),
    AuthModule,
    HabitsModule,
    NotesModule,
    TasksModule,
    FinancesModule,
    FoldersModule,
  ],
})
export class AppModule {}

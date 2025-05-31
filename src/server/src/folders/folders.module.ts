import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FoldersController } from "./folders.controller"
import { FoldersService } from "./folders.service"
import { Folder } from "./folder.entity"
import { FolderItem } from "./folder-item.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Folder, FolderItem])],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}

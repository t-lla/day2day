import { Controller, Get, Post, Body, Query } from "@nestjs/common"
import { FoldersService } from "./folders.service"

@Controller("folders")
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  async getFolders(@Query('userId') userId: string) {
    return this.foldersService.getFolders(Number(userId))
  }

  @Post()
  async createFolder(@Body() body: {
    userId: number;
    name: string;
    description: string;
    color?: string;
  }) {
    return this.foldersService.createFolder(body.userId, {
      name: body.name,
      description: body.description,
      color: body.color,
    });
  }

  @Post('sync')
  async syncFolders(@Body() body: { userId: number; folders: any[] }) {
    return this.foldersService.syncFolders(body.userId, body.folders);
  }
}

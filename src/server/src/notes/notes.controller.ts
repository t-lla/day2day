import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from "@nestjs/common"
import { NotesService } from "./notes.service"

@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getAll(@Query('userId', ParseIntPipe) userId: number) {
    return this.notesService.findAllByUser(userId);
  }

  @Post()
  async createNote(@Body() body: {
    userId: number;
    title: string;
    content: string;
    tags: string[];
  }) {
    return this.notesService.create(body.userId, {
      title: body.title,
      content: body.content,
      tags: body.tags,
    });
  }

  @Put(":id")
  async updateNote(
    @Param('id') id: string,
    @Body() body: {
    userId: number;
    title: string;
    content: string;
    tags: string[];
  },
  ) {
    return this.notesService.update(body.userId, Number.parseInt(id), {
      title: body.title,
      content: body.content,
      tags: body.tags,
    })
  }

  @Delete(':id')
  async deleteNote(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    await this.notesService.delete(userId, id);
    return { success: true };
  }

  @Post('sync')
  async syncNotes(@Body() body: { userId: number; notes: any[] }) {
    return this.notesService.syncNotes(body.userId, body.notes);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Note } from './note.entity';
import { Tag } from './tag.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, Tag]),
    UsersModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}

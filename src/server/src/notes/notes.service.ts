import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { Note } from './note.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,

    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async findAllByUser(userId: number): Promise<any[]> {
    const notes = await this.notesRepository.find({
      where: { user_id: userId },
      relations: ["tags"],
      order: { updated_at: "DESC" },
    })

    return notes.map((note) => ({
      id: note.note_id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags.map((tag) => tag.name),
      createdAt: note.created_at.toISOString(),
      updatedAt: note.updated_at.toISOString(),
    }))
  }

  async create(
    userId: number,
    noteData: {
      title: string
      content: string
      tags: string[]
    },
  ): Promise<any> {
    const note = this.notesRepository.create({
      user_id: userId,
      title: noteData.title,
      content: noteData.content,
    })

    const savedNote = await this.notesRepository.save(note)

    const tags = await this.createOrFindTags(userId, noteData.tags)
    savedNote.tags = tags
    await this.notesRepository.save(savedNote)

    return {
      id: savedNote.note_id.toString(),
      title: savedNote.title,
      content: savedNote.content,
      tags: noteData.tags,
      createdAt: savedNote.created_at.toISOString(),
      updatedAt: savedNote.updated_at.toISOString(),
    }
  }

  async update(
    userId: number,
    noteId: number,
    noteData: {
      title: string
      content: string
      tags: string[]
    },
  ): Promise<any> {
    const note = await this.notesRepository.findOne({
      where: { note_id: noteId, user_id: userId },
      relations: ["tags"],
    })

    if (!note) {
      throw new Error("Note not found")
    }

    note.title = noteData.title
    note.content = noteData.content

    const tags = await this.createOrFindTags(userId, noteData.tags)
    note.tags = tags

    const savedNote = await this.notesRepository.save(note)

    return {
      id: savedNote.note_id.toString(),
      title: savedNote.title,
      content: savedNote.content,
      tags: noteData.tags,
      createdAt: savedNote.created_at.toISOString(),
      updatedAt: savedNote.updated_at.toISOString(),
    }
  }

  async delete(userId: number, noteId: number): Promise<void> {
    await this.notesRepository.delete({ note_id: noteId, user_id: userId })
  }

  async syncNotes(userId: number, notes: any[]): Promise<any[]> {

    await this.notesRepository.delete({ user_id: userId })

    const savedNotes = []

    for (const note of notes) {
      const newNote = this.notesRepository.create({
        user_id: userId,
        title: note.title,
        content: note.content,
      })

      const saved = await this.notesRepository.save(newNote)

      const tags = await this.createOrFindTags(userId, note.tags)
      saved.tags = tags
      await this.notesRepository.save(saved)

      savedNotes.push({
        id: saved.note_id.toString(),
        title: saved.title,
        content: saved.content,
        tags: note.tags,
        createdAt: saved.created_at.toISOString(),
        updatedAt: saved.updated_at.toISOString(),
      })
    }

    return savedNotes
  }

  private async createOrFindTags(userId: number, tagNames: string[]): Promise<Tag[]> {
    const tags = []

    for (const tagName of tagNames) {
      let tag = await this.tagsRepository.findOne({
        where: { user_id: userId, name: tagName },
      })

      if (!tag) {
        tag = this.tagsRepository.create({
          user_id: userId,
          name: tagName,
        })
        tag = await this.tagsRepository.save(tag)
      }

      tags.push(tag)
    }

    return tags
  }
}
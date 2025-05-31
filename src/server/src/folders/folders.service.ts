import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Folder } from "./folder.entity"
import { FolderItem } from "./folder-item.entity"

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private foldersRepository: Repository<Folder>,
    @InjectRepository(FolderItem)
    private folderItemsRepository: Repository<FolderItem>,
  ) {}

  async getFolders(userId: number): Promise<any[]> {
    const folders = await this.foldersRepository.find({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });

    return folders.map((folder) => ({
      id        : folder.folder_id.toString(),
      name      : folder.name,
      description: "",
      color     : folder.color,
      createdAt : folder.created_at.toISOString(),
      updatedAt : folder.updated_at.toISOString(),
      itemIds: folder.items.map((it) => it.itemId.toString()),
    }));
  }

  async createFolder(
    userId: number,
    folderData: {
      name: string
      description: string
      color?: string
    },
  ): Promise<any> {
    const folder = this.foldersRepository.create({
      user_id: userId,
      name: folderData.name,
      color: folderData.color,
    })

    const saved = await this.foldersRepository.save(folder)

    return {
      id: saved.folder_id.toString(),
      name: saved.name,
      description: folderData.description,
      color: saved.color,
      createdAt: saved.created_at.toISOString(),
      updatedAt: saved.updated_at.toISOString(),
      itemIds: [],
    }
  }

  async addItemToFolder(
    folderId: number,
    itemId: number,
    itemType: FolderItem['itemType'],
  ): Promise<void> {

    const folderItem = this.folderItemsRepository.create({
      folderId,
      itemId,
      itemType,
    });

    await this.folderItemsRepository.save(folderItem);
  }

  async syncFolders(userId: number, folders: any[]): Promise<any[]> {

    await this.folderItemsRepository
      .createQueryBuilder()
      .delete()
      .where("folder_id IN (SELECT folder_id FROM Folders WHERE user_id = :userId)", { userId })
      .execute()

    await this.foldersRepository.delete({ user_id: userId })

    const savedFolders = []

    for (const folder of folders) {
      const newFolder = await this.createFolder(userId, folder)
      savedFolders.push(newFolder)
    }

    return savedFolders
  }
}
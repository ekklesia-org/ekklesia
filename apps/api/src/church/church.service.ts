import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CreateChurchSettingsDto, UpdateChurchSettingsDto } from './dto/church-settings.dto';

export abstract class ChurchService {
  abstract create(createChurchDto: CreateChurchDto): Promise<any>;
  abstract findAll(page?: number, limit?: number, includeInactive?: boolean): Promise<{
    churches: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  abstract findOne(id: string): Promise<any>;
  abstract findBySlug(slug: string): Promise<any>;
  abstract update(id: string, updateChurchDto: UpdateChurchDto): Promise<any>;
  abstract remove(id: string): Promise<any>;
  abstract hardDelete(id: string): Promise<void>;
  abstract createSettings(createSettingsDto: CreateChurchSettingsDto): Promise<any>;
  abstract updateSettings(churchId: string, updateSettingsDto: UpdateChurchSettingsDto): Promise<any>;
  abstract getSettings(churchId: string): Promise<any>;
  abstract transferUsers(fromChurchId: string, toChurchId: string): Promise<void>;
  abstract transferSuperAdmins(fromChurchId: string, toChurchId: string): Promise<void>;
  abstract getChurchesForTransfer(excludeChurchId: string): Promise<any[]>;
}

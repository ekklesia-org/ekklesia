import { Injectable } from '@nestjs/common';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { AddSocietyMemberDto } from './dto/add-society-member.dto';
import { UpdateSocietyMemberDto } from './dto/update-society-member.dto';
import { SocietyListResponse } from '@ekklesia/shared';

@Injectable()
export abstract class SocietiesService {
  abstract create(createSocietyDto: CreateSocietyDto): Promise<any>;
  abstract findAll(churchId: string, includeInactive?: boolean, page?: number, limit?: number): Promise<SocietyListResponse>;
  abstract findOne(id: string): Promise<any>;
  abstract findByType(churchId: string, type: string): Promise<any[]>;
  abstract update(id: string, updateSocietyDto: UpdateSocietyDto): Promise<any>;
  abstract remove(id: string): Promise<any>;

  // Society Members
  abstract addMember(societyId: string, addSocietyMemberDto: AddSocietyMemberDto): Promise<any>;
  abstract updateMember(societyId: string, memberId: string, updateSocietyMemberDto: UpdateSocietyMemberDto): Promise<any>;
  abstract removeMember(societyId: string, memberId: string): Promise<any>;
  abstract getMembers(societyId: string, includeInactive?: boolean): Promise<any[]>;
  abstract getMemberSocieties(memberId: string, includeInactive?: boolean): Promise<any[]>;
}

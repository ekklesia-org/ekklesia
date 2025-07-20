import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SocietiesService } from './societies.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { AddSocietyMemberDto } from './dto/add-society-member.dto';
import { UpdateSocietyMemberDto } from './dto/update-society-member.dto';
import { SocietyListResponse } from '@ekklesia/shared';

@Controller('societies')
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Post()
  create(@Body() createSocietyDto: CreateSocietyDto) {
    return this.societiesService.create(createSocietyDto);
  }

  @Get()
  async findAll(
    @Query('churchId') churchId: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<SocietyListResponse> {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);

    return this.societiesService.findAll(
      churchId,
      includeInactive === 'true',
      pageNumber,
      limitNumber
    );
  }

  @Get('by-type/:type')
  findByType(
    @Param('type') type: string,
    @Query('churchId') churchId: string
  ) {
    return this.societiesService.findByType(churchId, type as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.societiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSocietyDto: UpdateSocietyDto) {
    return this.societiesService.update(id, updateSocietyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.societiesService.remove(id);
  }

  // Society Members endpoints
  @Post(':id/members')
  addMember(
    @Param('id') societyId: string,
    @Body() addSocietyMemberDto: AddSocietyMemberDto
  ) {
    return this.societiesService.addMember(societyId, addSocietyMemberDto);
  }

  @Get(':id/members')
  getMembers(
    @Param('id') societyId: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    return this.societiesService.getMembers(societyId, includeInactive === 'true');
  }

  @Patch(':societyId/members/:memberId')
  updateMember(
    @Param('societyId') societyId: string,
    @Param('memberId') memberId: string,
    @Body() updateSocietyMemberDto: UpdateSocietyMemberDto
  ) {
    return this.societiesService.updateMember(societyId, memberId, updateSocietyMemberDto);
  }

  @Delete(':societyId/members/:memberId')
  removeMember(
    @Param('societyId') societyId: string,
    @Param('memberId') memberId: string
  ) {
    return this.societiesService.removeMember(societyId, memberId);
  }

  @Get('members/:memberId/societies')
  getMemberSocieties(
    @Param('memberId') memberId: string,
    @Query('includeInactive') includeInactive?: string
  ) {
    return this.societiesService.getMemberSocieties(memberId, includeInactive === 'true');
  }
}

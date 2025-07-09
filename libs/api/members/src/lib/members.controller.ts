import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@ApiTags('members')
@Controller('members')
@UseInterceptors(ClassSerializerInterceptor)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'The member has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of all members' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of members', example: 10 })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filter by church ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('churchId') churchId?: string
  ) {
    return this.membersService.findAll(page, limit, churchId || null);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a member by ID' })
  @ApiParam({ name: 'id', description: 'ID of the member' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a member' })
  @ApiParam({ name: 'id', description: 'ID of the member' })
  @ApiResponse({ status: 200, description: 'The member has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a member (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID of the member' })
  @ApiResponse({ status: 200, description: 'The member has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a member' })
  @ApiParam({ name: 'id', description: 'ID of the member' })
  @ApiResponse({ status: 200, description: 'The member has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  hardDelete(@Param('id') id: string) {
    return this.membersService.hardDelete(id);
  }
}

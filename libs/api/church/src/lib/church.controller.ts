import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ChurchService } from './church.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { CreateChurchSettingsDto, UpdateChurchSettingsDto } from './dto/church-settings.dto';

@ApiTags('churches')
@Controller('churches')
@UseInterceptors(ClassSerializerInterceptor)
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new church' })
  @ApiResponse({ status: 201, description: 'The church has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createChurchDto: CreateChurchDto) {
    return this.churchService.create(createChurchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of all churches' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of churches', example: 10 })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive churches', example: false })
  @ApiResponse({ status: 200, description: 'Success' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('includeInactive') includeInactive = false) {
    return this.churchService.findAll(page, limit, includeInactive);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a church by slug' })
  @ApiParam({ name: 'slug', description: 'Slug of the church' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findBySlug(@Param('slug') slug: string) {
    return this.churchService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a church by ID' })
  @ApiParam({ name: 'id', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findOne(@Param('id') id: string) {
    return this.churchService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a church' })
  @ApiParam({ name: 'id', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'The church has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  update(@Param('id') id: string, @Body() updateChurchDto: UpdateChurchDto) {
    return this.churchService.update(id, updateChurchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a church (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'The church has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  remove(@Param('id') id: string) {
    return this.churchService.remove(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a church' })
  @ApiParam({ name: 'id', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'The church has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  hardDelete(@Param('id') id: string) {
    return this.churchService.hardDelete(id);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create church settings' })
  @ApiResponse({ status: 201, description: 'The church settings have been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createSettings(@Body() createSettingsDto: CreateChurchSettingsDto) {
    return this.churchService.createSettings(createSettingsDto);
  }

  @Put('settings/:churchId')
  @ApiOperation({ summary: 'Update church settings' })
  @ApiParam({ name: 'churchId', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'The church settings have been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  updateSettings(@Param('churchId') churchId: string, @Body() updateSettingsDto: UpdateChurchSettingsDto) {
    return this.churchService.updateSettings(churchId, updateSettingsDto);
  }

  @Get('settings/:churchId')
  @ApiOperation({ summary: 'Get church settings' })
  @ApiParam({ name: 'churchId', description: 'ID of the church' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  getSettings(@Param('churchId') churchId: string) {
    return this.churchService.getSettings(churchId);
  }
}

// NOTE: Ensure imports correctly match your project structure and modules.

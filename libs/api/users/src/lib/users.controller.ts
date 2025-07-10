import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, ParseBoolPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { UserRole } from '@ekklesia/prisma';
import { CurrentUser, CurrentUserData } from '../../../src/lib/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: CurrentUserData
  ) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of all users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of users', example: 10 })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive users', example: false })
  @ApiQuery({ name: 'churchId', required: false, description: 'Filter by church ID (only for super admins)' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
  @ApiResponse({ status: 200, description: 'Success' })
  findAll(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('includeInactive', ParseBoolPipe) includeInactive = false,
    @Query('churchId') churchId?: string,
    @Query('role') role?: string
  ) {
    return this.usersService.findAll(page, limit, includeInactive, churchId, role, currentUser);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiParam({ name: 'email', description: 'Email of the user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The password has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @HttpCode(HttpStatus.OK)
  updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdateUserPasswordDto) {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a user' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  hardDelete(@Param('id') id: string) {
    return this.usersService.hardDelete(id);
  }

  @Get('church/:churchId')
  @ApiOperation({ summary: 'Get users by church ID' })
  @ApiParam({ name: 'churchId', description: 'ID of the church' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of users', example: 10 })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive users', example: false })
  @ApiResponse({ status: 200, description: 'Success' })
  findByChurch(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('churchId') churchId: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('includeInactive', ParseBoolPipe) includeInactive = false
  ) {
    return this.usersService.findByChurch(churchId, page, limit, includeInactive, currentUser);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate a user' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully activated.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deactivated.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'The user role has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
updateRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
    return this.usersService.updateRole(id, body.role);
  }
}

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  HttpException, 
  HttpStatus,
  ValidationPipe,
  UsePipes 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupDto } from './dto/setup.dto';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if system is initialized' })
  @ApiResponse({ status: 200, description: 'System status' })
  async getSetupStatus() {
    const isInitialized = await this.setupService.isSystemInitialized();
    return {
      isInitialized,
      needsSetup: !isInitialized
    };
  }

  @Post('initialize')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Initialize system with first admin user' })
  @ApiResponse({ status: 201, description: 'System initialized successfully' })
  @ApiResponse({ status: 400, description: 'System already initialized' })
  async initializeSystem(@Body() setupDto: SetupDto) {
    const isInitialized = await this.setupService.isSystemInitialized();
    
    if (isInitialized) {
      throw new HttpException(
        'System is already initialized',
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this.setupService.initializeSystem(setupDto);
    return {
      message: 'System initialized successfully',
      user: result.user,
      church: result.church
    };
  }
}

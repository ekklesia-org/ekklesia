import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Get,
  UseGuards,
  Request,
  NotFoundException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto, 
  UserProfileDto, 
  TokenVerificationDto 
} from './dto/auth.dto';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: string;
    churchId?: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password, returns JWT token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful', 
    type: AuthResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials or account deactivated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'User registration',
    description: 'Create a new user account, returns JWT token'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful', 
    type: AuthResponseDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'User with email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully', 
    type: UserProfileDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async getProfile(@Request() req: AuthenticatedRequest): Promise<UserProfileDto> {
    const user = await this.authService.validateUser(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      churchId: user.churchId,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Verify JWT token',
    description: 'Verify if the provided JWT token is valid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid', 
    type: TokenVerificationDto 
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async verifyToken(@Request() req: AuthenticatedRequest): Promise<TokenVerificationDto> {
    return {
      valid: true,
      userId: req.user.userId,
      username: req.user.username
    };
  }
}

import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Get,
  UseGuards,
  Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, LoginDto, RegisterDto } from './auth.service';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: string;
    churchId?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.validateUser(req.user.userId);
    if (!user) {
      return { message: 'User not found' };
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
  async verifyToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      userId: req.user.userId,
      username: req.user.username
    };
  }
}

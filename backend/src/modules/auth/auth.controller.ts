import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) dto: RegisterUserDto) {
    console.log('📝 REGISTRATION ENDPOINT HIT');
    console.log('👤 Registration request received:', {
      username: dto.username,
      email: dto.email,
      passwordLength: dto.password?.length || 0,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const result = await this.authService.registerUser(dto);
      console.log('✅ Registration successful for user:', dto.username);
      
      // Transform response to match frontend expectations
      return {
        user: result.user,
        accessToken: result.token,
      };
    } catch (error) {
      console.log('❌ Registration failed for user:', dto.username);
      console.log('🚨 Registration error:', error.message);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) dto: LoginUserDto) {
    console.log('🔐 LOGIN ENDPOINT HIT');
    console.log('📝 Login request received:', {
      username: dto.username,
      passwordLength: dto.password?.length || 0,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const result = await this.authService.login(dto);
      console.log('✅ Login successful for user:', dto.username);
      
      // Transform response to match frontend expectations
      return {
        user: result.user,
        accessToken: result.token,
      };
    } catch (error) {
      console.log('❌ Login failed for user:', dto.username);
      console.log('🚨 Login error:', error.message);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    // Get full user details from the database
    const user = await this.authService.getUserById(req.user.userId);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.username, // Use username as name
      },
    };
  }

  @Get('debug/users')
  async debugUsers() {
    console.log('🐛 DEBUG: Listing all users');
    const users = await this.authService.getAllUsers();
    console.log('👥 Users in database:', users.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email 
    })));
    return {
      count: users.length,
      users: users.map(u => ({ 
        id: u.id, 
        username: u.username, 
        email: u.email 
      }))
    };
  }
}

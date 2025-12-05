import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(dto: RegisterUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    token: string;
  }> {
    // Check for existing username
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check for existing email
    const existingEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(dto.password);

    // Create user
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const token = this.generateJwtToken(savedUser);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<User | null> {
    console.log('🔎 Looking up user in database:', username);
    
    const user = await this.userRepository.findOne({ where: { username } });
    
    if (!user) {
      console.log('❌ User not found in database:', username);
      return null;
    }
    
    console.log('✅ User found in database:', {
      id: user.id,
      username: user.username,
      email: user.email,
    });
    
    console.log('🔐 Comparing passwords...');
    const passwordMatch = await this.comparePasswords(password, user.passwordHash);
    
    if (passwordMatch) {
      console.log('✅ Password match successful');
      return user;
    } else {
      console.log('❌ Password match failed');
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateJwtToken(user: User): string {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload);
  }

  async login(dto: LoginUserDto): Promise<{
    user: Omit<User, 'passwordHash'>;
    token: string;
  }> {
    console.log('🔍 AuthService.login called with username:', dto.username);
    
    const user = await this.validateUser(dto.username, dto.password);
    if (!user) {
      console.log('❌ User validation failed for username:', dto.username);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('✅ User validation successful for:', dto.username);
    const token = this.generateJwtToken(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/user.entity/user.entity';

export interface SignUpDto {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ user: Omit<UserEntity, 'password'>; accessToken: string }> {
    const { username, password, email, fullName, role } = signUpDto;
    
    // Check if user already exists
    const existingUser = await this.userService.getUserByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const userData: Partial<UserEntity> = {
      username,
      password: hashedPassword,
      role: role || 'staff',
    };
    
    if (email) userData.email = email;
    if (fullName) userData.fullName = fullName;
    
    const newUser = await this.userService.createUser(userData as UserEntity);

    // Generate token
    const payload = { username: newUser.username, sub: newUser.id };
    const accessToken = await this.jwtService.sign(payload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    return { user: userWithoutPassword, accessToken };
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<UserEntity, 'password'>; accessToken: string }> {
    const { username, password } = loginDto;
    const userFound = await this.userService.getUserByUsername(username);

    if (userFound && (await bcrypt.compare(password, userFound.password))) {
      const payload = { username: userFound.username, sub: userFound.id };
      const accessToken = await this.jwtService.sign(payload);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = userFound;
      
      return { user: userWithoutPassword, accessToken };
    } else {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async validateUser(username: string): Promise<UserEntity | null> {
    return this.userService.getUserByUsername(username);
  }
}

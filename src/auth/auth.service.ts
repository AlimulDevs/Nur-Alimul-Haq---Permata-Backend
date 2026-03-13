import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 409 — duplicate email
    const exists = await this.usersService.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictException({
        error: {
          code: 'CONFLICT',
          message: 'Email already registered',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: dto.fullName,
      role: UserRole.CUSTOMER, // only customer can self-register
    });

    return this.buildAuthResponse(user.id, user.email, user.fullName, user.role);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase().trim(),
    );

    if (!user) {
      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        },
      });
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        },
      });
    }

    return this.buildAuthResponse(user.id, user.email, user.fullName, user.role);
  }

  private buildAuthResponse(
    id: string,
    email: string,
    fullName: string,
    role: string,
  ): AuthResponse {
    const payload: JwtPayload = { sub: id, email, role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
      user: { id, email, fullName, role },
    };
  }
}

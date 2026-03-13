import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new customer account',
    description: 'Creates a new user with the CUSTOMER role.',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
    schema: {
      example: { error: { code: 'CONFLICT', message: 'Email already registered' } },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and obtain JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Returns access token on successful login',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: { error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

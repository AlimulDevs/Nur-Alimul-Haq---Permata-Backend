import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Secret@123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}

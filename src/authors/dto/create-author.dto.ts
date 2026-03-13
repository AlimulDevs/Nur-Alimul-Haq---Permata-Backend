import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'J.K. Rowling', description: 'Author full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'British author best known for the Harry Potter series.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}

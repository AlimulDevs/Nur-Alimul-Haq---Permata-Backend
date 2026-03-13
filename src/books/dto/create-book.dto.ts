import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsISBN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter and the Philosopher\'s Stone' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    example: 'c3d9a71e-0000-0000-0000-000000000001',
    description: 'UUID of the author',
  })
  @IsUUID('4', { message: 'authorId must be a valid UUID' })
  authorId: string;

  @ApiProperty({ example: '978-3-16-148410-0', description: 'ISBN-10 or ISBN-13' })
  @IsISBN(undefined, { message: 'isbn must be a valid ISBN-10 or ISBN-13' })
  isbn: string;

  @ApiProperty({ example: 29.99, description: 'Price (must be ≥ 0)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'price must be >= 0' })
  price: number;

  @ApiProperty({ example: 100, description: 'Stock quantity (must be ≥ 0)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'stock must be >= 0' })
  stock: number;

  @ApiProperty({
    example: '1997-06-26',
    required: false,
    description: 'Publication date (ISO 8601 date string)',
  })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { UserRole } from '@/users/entities/user.entity';

@ApiTags('Books')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // ─── Public (customer + admin) ────────────────────────────────────────────

  @Get()
  @ResponseMessage('Data buku berhasil diambil')
  @ApiOperation({
    summary: 'List all books with optional filters + pagination',
    description:
      'Supports filtering by `authorId`, `q` (title search), `minPrice`, `maxPrice` and pagination via `page` & `limit`.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of books' })
  findAll(@Query() filter: FilterBookDto) {
    return this.booksService.findAll(filter);
  }

  @Get(':id')
  @ResponseMessage('Detail buku berhasil diambil')
  @ApiOperation({ summary: 'Get a single book by ID' })
  @ApiResponse({ status: 200, description: 'Book found' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.findOne(id);
  }

  // ─── Admin only ───────────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Buku berhasil dibuat')
  @ApiOperation({ summary: 'Create a new book [Admin only]' })
  @ApiResponse({ status: 201, description: 'Book created' })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: {
        error: { code: 'VALIDATION_ERROR', message: 'isbn must be a valid ISBN' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 409, description: 'Duplicate ISBN' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Buku berhasil diperbarui')
  @ApiOperation({ summary: 'Update a book [Admin only]' })
  @ApiResponse({ status: 200, description: 'Book updated' })
  @ApiResponse({ status: 404, description: 'Book or Author not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Buku berhasil dihapus')
  @ApiOperation({ summary: 'Delete a book [Admin only]' })
  @ApiResponse({ status: 200, description: 'Book deleted' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.booksService.remove(id);
  }
}

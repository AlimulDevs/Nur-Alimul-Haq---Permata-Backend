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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/users/entities/user.entity';

@ApiTags('Authors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // ─── Public (customer + admin) ────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List all authors' })
  @ApiResponse({ status: 200, description: 'Array of authors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single author by ID' })
  @ApiResponse({ status: 200, description: 'Author found' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.findOne(id);
  }

  // ─── Admin only ───────────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new author [Admin only]' })
  @ApiResponse({ status: 201, description: 'Author created' })
  @ApiResponse({ status: 403, description: 'Forbidden – admin role required' })
  create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an author [Admin only]' })
  @ApiResponse({ status: 200, description: 'Author updated' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an author [Admin only]' })
  @ApiResponse({ status: 204, description: 'Author deleted' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.remove(id);
  }
}

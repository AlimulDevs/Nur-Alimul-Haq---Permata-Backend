import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthorsRepository } from './authors.repository';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorsService {
  constructor(private readonly authorsRepository: AuthorsRepository) {}

  findAll(): Promise<Author[]> {
    return this.authorsRepository.findAll();
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findById(id);
    if (!author) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: `Author with id '${id}' not found`,
        },
      });
    }
    return author;
  }

  create(dto: CreateAuthorDto): Promise<Author> {
    return this.authorsRepository.create(dto);
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    return this.authorsRepository.update(author, dto);
  }

  async remove(id: string): Promise<void> {
    const author = await this.findOne(id);
    await this.authorsRepository.delete(author);
  }
}

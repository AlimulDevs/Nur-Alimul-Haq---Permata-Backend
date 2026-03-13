import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorsRepository {
  constructor(
    @InjectRepository(Author)
    private readonly repo: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findById(id: string): Promise<Author | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateAuthorDto): Promise<Author> {
    const author = this.repo.create(dto);
    return this.repo.save(author);
  }

  async update(author: Author, dto: UpdateAuthorDto): Promise<Author> {
    Object.assign(author, dto);
    return this.repo.save(author);
  }

  async delete(author: Author): Promise<void> {
    await this.repo.remove(author);
  }
}

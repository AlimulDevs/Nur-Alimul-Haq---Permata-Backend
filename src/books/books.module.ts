import { Module } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { AuthorsModule } from '@/authors/authors.module';

@Module({
  imports: [AuthorsModule],
  controllers: [BooksController],
  providers: [BooksRepository, BooksService],
})
export class BooksModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { AuthorsRepository } from './authors.repository';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorsController],
  providers: [AuthorsRepository, AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}

import { Module } from '@nestjs/common';
import { AuthorsRepository } from './authors.repository';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';

@Module({
  controllers: [AuthorsController],
  providers: [AuthorsRepository, AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}

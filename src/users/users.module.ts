import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [UsersRepository, UsersService],
  // Export both so AuthModule can inject UsersRepository directly
  // and other modules can use UsersService for business-level operations
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersServiceDrizzle } from './users.service.drizzle';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    {
      provide: UsersService,
      useClass: UsersServiceDrizzle,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

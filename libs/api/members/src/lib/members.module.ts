import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MembersServiceDrizzle } from './members.service.drizzle';

@Module({
  imports: [DatabaseModule],
  controllers: [MembersController],
  providers: [
    {
      provide: MembersService,
      useClass: MembersServiceDrizzle,
    },
  ],
  exports: [MembersService],
})
export class MembersModule {}

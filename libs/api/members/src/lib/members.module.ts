import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}

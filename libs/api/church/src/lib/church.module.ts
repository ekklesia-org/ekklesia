import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ChurchController],
  providers: [ChurchService],
  exports: [ChurchService],
})
export class ChurchModule {}

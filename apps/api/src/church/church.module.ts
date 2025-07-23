import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { ChurchServiceDrizzle } from './church.service.drizzle';

@Module({
  imports: [DatabaseModule],
  controllers: [ChurchController],
  providers: [
    {
      provide: ChurchService,
      useClass: ChurchServiceDrizzle,
    },
  ],
  exports: [ChurchService],
})
export class ChurchModule {}

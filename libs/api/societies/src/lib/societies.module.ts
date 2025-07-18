import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ekklesia/database';
import { SocietiesController } from './societies.controller';
import { SocietiesService } from './societies.service';
import { SocietiesServiceDrizzle } from './societies.service.drizzle';

@Module({
  imports: [DatabaseModule],
  controllers: [SocietiesController],
  providers: [
    {
      provide: SocietiesService,
      useClass: SocietiesServiceDrizzle,
    },
  ],
  exports: [SocietiesService],
})
export class SocietiesModule {}

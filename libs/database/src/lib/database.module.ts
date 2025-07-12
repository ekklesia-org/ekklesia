import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './database.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}

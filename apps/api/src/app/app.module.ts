import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@ekklesia/api/lib/auth.module';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { ChurchModule } from '@ekklesia/api/church';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ChurchModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

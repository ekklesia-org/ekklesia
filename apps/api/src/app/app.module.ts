import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@ekklesia/api/lib/auth.module';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { ChurchModule } from '@ekklesia/api/church';
import { MembersModule } from '@ekklesia/api/members';
import { SocietiesModule } from '@ekklesia/api/societies';
import { UsersModule } from '@ekklesia/api/users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ChurchModule,
    MembersModule,
    SocietiesModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

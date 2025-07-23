import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from 'apps/api/src/auth/auth.module';
import { DatabaseModule } from '@ekklesia/database/lib/database.module';
import { ChurchModule } from 'apps/api/src/church/church.module';
import { MembersModule } from 'apps/api/src/members/members.module';
import { SocietiesModule } from 'apps/api/src/societies/societies.module';
import { UsersModule } from 'apps/api/src/users/users.module';

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

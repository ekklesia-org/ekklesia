import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'defaultSecret',
      signOptions: {
        expiresIn: process.env['JWT_EXPIRATION'] || '1h',
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, JwtStrategy, PassportModule],
})
export class AuthModule {}

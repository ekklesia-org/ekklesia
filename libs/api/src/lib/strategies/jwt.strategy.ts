import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'defaultSecret',
    });
  }

async validate(payload: { sub: string; username: string; role: string; churchId?: string }) {
    return { 
      userId: payload.sub, 
      username: payload.username,
      role: payload.role,
      churchId: payload.churchId
    };
  }
}

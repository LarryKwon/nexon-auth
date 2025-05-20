// src/auth/strategies/jwt.strategy.ts (또는 jwt-access.strategy.ts)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import settings from '../../settings';

interface ValidatedUserPayload {
  _id: string;
  username: string;
  roles: string[];
  email?: string;
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings().jwtConfig().accessSecret,
    });
  }

  async validate(payload: any): Promise<ValidatedUserPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.authService.validateUserForJwt(payload);
    if (!user) {
      throw new UnauthorizedException(
        'User not found, deactivated, or token invalid',
      );
    }
    return {
      _id: user._id.toString(),
      username: user.username,
      roles: user.roles,
      email: user.email,
      isActive: user.isActive,
    };
  }
}

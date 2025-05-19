import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import settings from '../../settings'; // AuthService 주입

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: settings().jwtConfig().refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshTokenFromBody = req.body.refreshToken;

    if (!payload || !payload.sub || !refreshTokenFromBody) {
      throw new UnauthorizedException('Invalid refresh token or payload');
    }

    try {
      const userPayload = await this.authService.getUserIfRefreshTokenMatches(
        refreshTokenFromBody,
        payload.sub, // userId from JWT payload
      );

      return {
        ...userPayload,
        userId: userPayload._id.toString(),
        refreshToken: refreshTokenFromBody,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token validation failed',
        error.message,
      );
    }
  }
}

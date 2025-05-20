import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import settings from '../../settings'; // AuthService 주입

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings().jwtConfig().refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token or payload');
    }
    let refreshTokenFromHeader = '';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      refreshTokenFromHeader = authHeader.substring(7); // "Bearer " 다음의 토큰 문자열 추출
    }
    try {
      const userPayload = await this.authService.getUserIfRefreshTokenMatches(
        refreshTokenFromHeader,
        payload.sub, // userId from JWT payload
      );

      return {
        ...userPayload,
        userId: userPayload._id.toString(),
        refreshToken: refreshTokenFromHeader,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token validation failed',
        error.message,
      );
    }
  }
}

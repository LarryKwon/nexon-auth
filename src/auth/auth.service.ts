import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import settings from '../settings';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from './schemas/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { username, password, email, roles: dtoRoles } = createUserDto;
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const rolesToSave =
      dtoRoles && dtoRoles.length > 0 ? dtoRoles : [Role.USER];

    const newUser = new this.userModel({
      username,
      passwordHash,
      email,
      roles: rolesToSave,
    });
    const savedUser = await newUser.save();
    const userObject = savedUser.toObject({ virtuals: true });

    return {
      _id: userObject._id.toString(),
      username: userObject.username,
      email: userObject.email,
      roles: userObject.roles,
      isActive: userObject.isActive,
      createdAt: userObject.createdAt,
      updatedAt: userObject.updatedAt,
    };
  }

  private async generateTokens(
    userId: string,
    username: string,
    roles: string[],
  ) {
    const accessTokenPayload = { sub: userId, username, roles };
    const refreshTokenPayload = { sub: userId, username }; // Refresh token might have less info

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: settings().jwtConfig().accessSecret,
      expiresIn: settings().jwtConfig().accessExpires,
    });

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: settings().jwtConfig().refreshSecret,
      expiresIn: settings().jwtConfig().refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = loginDto;
    const user = await this.userModel
      .findOne({ username })
      .select('+passwordHash +currentHashedRefreshToken'); // Ensure passwordHash is selected
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new ForbiddenException('User account is inactive.');
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user._id.toString(),
      user.username,
      user.roles,
    );

    const saltRounds = 10;
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    user.currentHashedRefreshToken = hashedRefreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async refreshTokens(
    userId: string,
    providedRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userModel
      .findById(userId)
      .select('+currentHashedRefreshToken');
    if (!user || !user.currentHashedRefreshToken) {
      throw new ForbiddenException('Access Denied: No active refresh token.');
    }

    console.log(user);
    console.log(providedRefreshToken);
    const isValidRefreshToken = await bcrypt.compare(
      providedRefreshToken,
      user.currentHashedRefreshToken,
    );
    if (!isValidRefreshToken) {
      user.currentHashedRefreshToken = null;
      await user.save();
      throw new ForbiddenException('Access Denied: Invalid refresh token.');
    }

    const {
      accessToken: newRotatedAccessToken,
      refreshToken: newRotatedRefreshToken,
    } = await this.generateTokens(
      user._id.toString(),
      user.username,
      user.roles,
    );
    const saltRounds = 10;
    user.currentHashedRefreshToken = await bcrypt.hash(
      newRotatedRefreshToken,
      saltRounds,
    );
    await user.save();
    return {
      accessToken: newRotatedAccessToken,
      refreshToken: newRotatedRefreshToken,
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.currentHashedRefreshToken = null;
      await user.save();
    }
    return { message: 'Logout successful' };
  }

  async validateUserForJwt(payload: any) {
    console.log(payload);
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      return null; // Or throw an exception
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, currentHashedRefreshToken, ...result } =
      user.toObject();
    return result; // This will be attached to request.user
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<Pick<UserDocument, 'username' | '_id' | 'roles'>> {
    const user = await this.userModel
      .findById(userId)
      .select('+currentHashedRefreshToken +roles +username')
      .lean();

    if (!user || !user.currentHashedRefreshToken) {
      throw new ForbiddenException(
        'Access Denied: Refresh token not recognized or revoked.',
      );
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new ForbiddenException('Access Denied: Refresh token mismatch.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentHashedRefreshToken, passwordHash, ...userPayload } = user;
    return userPayload as Pick<UserDocument, 'username' | '_id' | 'roles'>; // Cast to ensure type
  }
}

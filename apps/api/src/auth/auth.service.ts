import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UserProfileDto } from '@typingtyphon/contracts';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(private readonly prisma: PrismaService) {
    const isProd = process.env.NODE_ENV === 'production';
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (isProd && (!accessSecret || accessSecret.includes('dev_jwt') || !refreshSecret || refreshSecret.includes('dev_jwt'))) {
      throw new Error(
        'FATAL: In production, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be explicitly configured with strong unique cryptographic secrets.'
      );
    }

    this.jwtSecret = accessSecret || 'dev_jwt_access_secret_super_secure_32_characters_minimum';
    this.jwtRefreshSecret = refreshSecret || 'dev_jwt_refresh_secret_super_secure_32_characters_minimum';
  }

  private async hashRefreshToken(token: string): Promise<string> {
    const digest = crypto.createHash('sha256').update(token).digest('hex');
    return bcrypt.hash(digest, 10);
  }

  private async compareRefreshToken(token: string, hash: string): Promise<boolean> {
    const digest = crypto.createHash('sha256').update(token).digest('hex');
    return bcrypt.compare(digest, hash);
  }

  async register(dto: RegisterDto): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase().trim() },
    });
    if (existingUsername) {
      throw new ConflictException('This username is already taken. Please choose another.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        username: dto.username.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName?.trim() || null,
        role: 'USER',
        isEmailVerified: false,
      },
    });

    const userProfile = this.toUserProfile(user);
    const tokens = this.generateTokens(user.id, user.role);

    // Save hashed refresh token for rotation and revocation tracking (SHA256 pre-hashed)
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: userProfile,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const userProfile = this.toUserProfile(user);
    const tokens = this.generateTokens(user.id, user.role);

    // Update stored refresh token hash upon new login (SHA256 pre-hashed)
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: userProfile,
      ...tokens,
    };
  }

  /**
   * Rotates refresh tokens and detects reuse attempts.
   */
  async refreshTokens(oldRefreshToken: string): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: { sub: string; role: string };
    try {
      payload = jwt.verify(oldRefreshToken, this.jwtRefreshSecret) as { sub: string; role: string };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session has been revoked or is no longer valid. Please sign in again.');
    }

    const isMatch = await this.compareRefreshToken(oldRefreshToken, user.refreshTokenHash);
    if (!isMatch) {
      // Possible token reuse / breach! Invalidate active session to protect the user
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('Invalid or reused refresh token. All active sessions invalidated for security.');
    }

    // Rotate tokens
    const tokens = this.generateTokens(user.id, user.role);
    const newRefreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    return {
      user: this.toUserProfile(user),
      ...tokens,
    };
  }

  /**
   * Revokes stored refresh token hash (used on logout).
   */
  async revokeUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    } catch {
      // Ignore if user no longer exists
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }
    return this.toUserProfile(user);
  }

  public verifyToken(token: string): { sub: string; role: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { sub: string; role: string };
    } catch {
      return null;
    }
  }

  private generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign({ sub: userId, role }, this.jwtSecret, { expiresIn: '15m' });
    const jti = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const refreshToken = jwt.sign({ sub: userId, role, jti }, this.jwtRefreshSecret, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  private toUserProfile(user: any): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

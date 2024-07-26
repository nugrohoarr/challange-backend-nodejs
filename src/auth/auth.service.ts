import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import { JwtPayload, Tokens } from './types';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { IncomingHttpHeaders } from 'http';


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(user.id);
    return tokens;
  }
  async getTokens(userId: string): Promise<Tokens> {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const jwtPayload: JwtPayload = {
      id: user.id,
      email: user.email,
    };
  
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: this.config.get<string>('AT_SECRET'),
    });
  
    return {
      access_token: accessToken,
    };
  }
  async changePassword( @Req() req: Request,oldPassword: string,newPassword: string,) {
    const headers = req.headers as unknown as IncomingHttpHeaders;
    if (!headers || !headers.authorization) {
      throw new Error('Authorization header is missing');
    }
  
    const token = headers.authorization.split(' ')[1];
    const userId = await this.extractUserIdFromToken(token);

    await this.verifyPassword(oldPassword, userId);

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return result;
  }
  async verifyPassword( oldPassword: string, userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }
  }
  async extractUserIdFromToken(token: string): Promise<string> {
    const decoded: any = this.jwtService.decode(token);
    if (!decoded || !decoded.id) {
      throw new Error('Invalid JWT token or missing user ID');
    }
    return decoded.id;
  }
}
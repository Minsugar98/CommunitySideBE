import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      // Prisma를 직접 사용하여 유저 조회
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
      }

      if (!user.password) {
        throw new UnauthorizedException('잘못된 계정 정보입니다.');
      }

      // bcrypt를 사용하여 암호화된 비밀번호 비교
      const isPasswordMatching = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordMatching) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
      }

      const payload = { sub: user.id, email: user.email };
      
      // JWT 서명 시 에러 방지를 위한 체크
      if (!process.env.JWT_SECRET) {
        this.logger.error('JWT_SECRET이 환경 변수에 설정되지 않았습니다.');
      }

      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.logger.error(`Login Service Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}

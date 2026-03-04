import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Logger } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response, // passthrough를 true로 해야 NestJS의 일반적인 반환값 처리가 가능합니다.
  ) {
    this.logger.log(`로그인 시도: ${loginDto.email}`); // 진입 로그 추가
    try {
      const { accessToken } = await this.authService.login(loginDto);

      // 쿠키에 토큰 저장
      res.cookie('access_token', accessToken, {
        httpOnly: true, // 자바스크립트에서 접근 불가 (보안)
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
        sameSite: 'lax', // CSRF 방어
        maxAge: 3600000, // 1시간 (밀리초 단위)
      });

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: '로그인 성공',
        timeStamp: new Date(),
      };
    } catch (e) {
      this.logger.error(
        `로그인 에러 발생 (${loginDto.email}): ${e.message}`,
        e.stack,
      );
      throw e;
    }
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    // success 필드를 추가하여 프론트엔드 규격을 맞춤
    return {
      success: true,
      statusCode: 200,
      message: '로그아웃 성공',
      timStamp: new Date()
    };
  }
}

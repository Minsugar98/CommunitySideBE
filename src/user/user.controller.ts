import {
  Controller,
  Post,
  Body,
  Patch,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { SignUpDto } from './dto/signUp.dto.js';
import { UserEditDto } from './dto/userEdit.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Logger } from '@nestjs/common';
import { timeStamp } from 'console';
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    await this.userService.signUp(signUpDto);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '회원가입 성공 성공',
      timeStamp: new Date(),
    };
  }

  @Patch('edit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async userEdit(
    @Req() { user }: any, // Request 객체에서 유저 정보를 구조 분해 할당
    @Body() userEditDto: UserEditDto,
  ) {
    this.logger.log(user.id);
    // 인증 가드에서 주입해준 유저 ID 사용 (예: req.user.id)
    const userId = user.id;

    await this.userService.editUser(userId, userEditDto);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '회원 정보 수정 성공',
      timeStamp: new Date(),
    };
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async userMe(@Req() { user }: any) {
    const userId = user.id;

    const userData = await this.userService.userMe(userId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: userData,
      timeStamp: new Date(),
    };
  }
}

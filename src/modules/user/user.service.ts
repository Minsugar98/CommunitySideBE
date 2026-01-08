import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SignUpDto } from './dto/signUp.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    // 1. 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 사용자 생성 및 DB 저장
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // 4. 생성된 사용자 정보에서 비밀번호를 제외하고 반환
    const { password: _, ...result } = user;
    return result;
  }
}

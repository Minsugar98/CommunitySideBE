import { Injectable, ConflictException, Logger ,HttpStatus} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserEditDto } from './dto/userEdit.dto.js';
import { SignUpDto } from './dto/signUp.dto.js';
import bcrypt from 'bcrypt';
import { BaseException } from '../common/interceptors/BaseException.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly prisma: PrismaService) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { email, password } = signUpDto;

    // 1. 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BaseException('이미 가입된 이메일입니다.',HttpStatus.CONFLICT);
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 사용자 생성 및 DB 저장
    await this.prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return;
  }

  async editUser(userId: number, userEditDto: UserEditDto): Promise<void> {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { ...userEditDto },
      });
      this.logger.log(userEditDto)
    return;
  }

  async userMe(userId: number) {
    // try-catch 제거
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select:{
        id:true,
        email:true,
        nickname:true,
        position:true,
        career:true,
        bio:true,
        urlLinks:true
      }
    });
    

    if (!user) {
      throw new BaseException('유저 정보 권한이 없습니다.', HttpStatus.UNAUTHORIZED);
    }
    
    return {user};
  }
}

import {
  Injectable,
  ConflictException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserEditDto } from './dto/userEdit.dto.js';
import { SignUpDto } from './dto/signUp.dto.js';
import bcrypt from 'bcrypt';
import { BaseException } from '../common/interceptors/BaseException.js';
import { randomInt } from 'node:crypto';

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
      throw new BaseException('이미 가입된 이메일입니다.', HttpStatus.CONFLICT);
    }

    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 중복되지 않는 랜덤 닉네임 생성
    let nickname = '';
    let isNicknameUnique = false;

    while (!isNicknameUnique) {
      nickname = this.generateRandomNickname();

      // DB에서 닉네임 중복 확인
      const nicknameExists = await this.prisma.user.findUnique({
        where: { nickname },
      });

      if (!nicknameExists) {
        isNicknameUnique = true;
      }
    }

    // 4. 사용자 생성 및 DB 저장
    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: nickname,
      },
    });

    return;
  }

  /** 닉네임 생성 보조 함수 */
  private generateRandomNickname(): string {
    const adjectives = [
      '꿈꾸는',
      '열정적인',
      '창의적인',
      '도전하는',
      '빛나는',
      '섬세한',
      '똑똑한',
      '유능한',
      '든든한',
      '성실한',
      '기발한',
      '민첩한',
      '유연한',
      '대담한',
      '조화로운',
      '끝없는',
      '확실한',
      '훌륭한',
      '친절한',
      '예리한',
      '성숙한',
      '용감한',
      '침착한',
      '신속한',
      '정교한',
      '협력하는',
      '몰입하는',
      '비상하는',
      '준비된',
      '진취적인',
    ];

    const nouns = [
      '메이커',
      '챌린저',
      '파트너',
      '러너',
      '리더',
      '기획자',
      '개발자',
      '아티스트',
      '서포터',
      '개척자',
      '마스터',
      '위저드',
      '멘토',
      '가이드',
      '엔진',
      '크리에이터',
      '빌더',
      '설계자',
      '동료',
      '캡틴',
      '프로',
      '전문가',
      '스페셜리스트',
      '프론티어',
      '루키',
      '에이전트',
      '멤버',
      '플레이어',
      '스타터',
      '브레인',
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 900) + 100; // 100 ~ 999

    return `${adj}${noun}${num}`;
  }

  async editUser(userId: number, dto: UserEditDto) {
    const updateData: any = { ...dto };

    // 비밀번호가 있다면 암호화 처리
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(dto.password, salt);
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async userMe(userId: number) {
    // try-catch 제거
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        position: true,
        profileImage: true,
        career: true,
        bio: true,
        urlLinks: true,
        // 💡 assignedToId를 기준으로 해당 유저에게 할당된 태스크들을 가져옵니다.
        assignedTasks: {
          where: {
            assignedToId: userId,
          },
          select: {
            id: true,
            title: true,
            status: true,
            description:true,
            dueDate: true,
            projectId: true, // 어떤 프로젝트의 업무인지 확인용
          },
        },
      },
    });

    if (!user) {
      throw new BaseException(
        '유저 정보 권한이 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return { user };
  }
}

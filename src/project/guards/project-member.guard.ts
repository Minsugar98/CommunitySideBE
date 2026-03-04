import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BaseException } from '../../common/interceptors/BaseException.js';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. JwtAuthGuard가 채워준 유저 정보 추출
    const user = request.user;
    const projectId = parseInt(request.params.projectId);

    if (!user || isNaN(projectId)) {
      throw new BaseException(
        '유효하지 않은 접근입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // [검증 1] Project 테이블에서 리더인지 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { leaderId: true }, // leaderId만 쏙 가져오기
    });

    if (!project) {
      throw new BaseException(
        '존재하지 않는 프로젝트입니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 리더가 맞다면 바로 통과
    if (project.leaderId === user.id) {
      return true;
    }

    // [검증 2] 리더가 아니라면, ProjectApplication에서 승인된 멤버인지 확인
    const application = await this.prisma.projectApplication.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: projectId,
        },
      },
    });

    // 신청 내역이 없거나, 상태가 ACCEPTED가 아니면 에러 발생
    if (!application || application.Status !== 'ACCEPTED') {
      throw new BaseException(
        '이 프로젝트의 멤버만 접근할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    // 리더는 아니지만 승인된 멤버이므로 통과
    return true;
  }
}

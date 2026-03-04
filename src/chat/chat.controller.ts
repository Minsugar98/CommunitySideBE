import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'; // 프로젝트 경로에 맞게 수정
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js'; // 가드 경로 확인
import { ProjectMemberGuard } from '../project/guards/project-member.guard.js'; // 가드 경로 확인

@Controller('projects/:projectId/chat')
export class ChatController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('messages')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  async getChatMessages(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    const limit = 50; // 한 번에 불러올 메시지 수
    const skip = (page - 1) * limit;

    // 1. 해당 프로젝트의 채팅방에 속한 메시지 조회
    const messages = await this.prisma.message.findMany({
      where: {
        chatRoom: {
          projectId: projectId,
        },
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc', // 최신순으로 가져와서 페이징 처리
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            // profileImage: true, // 유저 프로필 이미지가 있다면 추가
          },
        },
      },
    });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '채팅 기록 조회를 완료했습니다.',
      // 💡 팁: 프론트엔드에서는 과거 순서대로 보여줘야 하므로 배열을 뒤집어줍니다.
      data: messages.reverse(),
      meta: {
        page,
        count: messages.length,
      },
      timeStamp: new Date(),
    };
  
  }
}
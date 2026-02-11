import { Injectable,HttpStatus } from '@nestjs/common';
import { CreateCommentDto } from './dto/createComment.dto.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { BaseException } from '../common/interceptors/BaseException.js';
@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    userId: number,
    projectId: number,
    postId: number,
    dto: CreateCommentDto,
  ) {
    // 1. 게시글이 존재하고, 해당 프로젝트의 글이 맞는지 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.projectId !== projectId) {
      throw new BaseException(
        '유효하지 않은 게시글 접근입니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    // 2. 댓글 생성
    await this.prisma.comment.create({
      data: {
        content: dto.content,
        userId: userId,
        postId: postId,
      },
      include: {
        user: {
          select: { nickname: true } // 생성 직후 닉네임을 바로 내려주면 프론트에서 그리기 편합니다.
        }
      }
    });

    return 
  }
}
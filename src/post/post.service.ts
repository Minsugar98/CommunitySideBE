import { Injectable,HttpStatus,Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'
import { CreatePostDto } from './dto/create-Post.dto.js'
@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name)
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: number, projectId: number, dto: CreatePostDto) {
    // 가드에서 검증이 끝났으므로 바로 생성 로직 진행
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        userId: userId,    // 게시글 작성자
        projectId: projectId, // 소속 프로젝트
      },
    });

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '게시글이 성공적으로 작성되었습니다.',
      data: post,
      timeStamp: new Date(),
    };
  }
}
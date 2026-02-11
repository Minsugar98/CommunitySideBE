import { Injectable,HttpStatus,Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'
import { CreatePostDto } from './dto/createPost.dto.js'
import { GetPostsDto } from './dto/getPosts.dto.js'
import { BaseException } from '../common/interceptors/BaseException.js';
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

  async findAllByPost(projectId: number, query: GetPostsDto) {
    // 에러 방지: page와 limit에 기본값을 할당하여 undefined 가능성 제거
    const { page = 1, limit = 10, keyword } = query;
    const skip = (page - 1) * limit;
  
    // 검색 조건 설정
    const where: any = {
      projectId: projectId,
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
    };
  
    // 병렬 실행으로 성능 최적화
    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            }
          }
        }
      })
    ]);
  
    return {
      posts,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    };
  }

  async findByPost(projectId: number, postId:number){
    const data = await this.prisma.post.findUnique({
      where:{
        id:postId
      }
    })

    if(!data){
      throw new BaseException('해당 게시글이 없습니다.',HttpStatus.NOT_FOUND)
    }
    return data
  }
}
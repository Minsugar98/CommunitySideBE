import { Injectable,HttpStatus,Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'
import { CreatePostDto } from './dto/createPost.dto.js'
import { GetPostsDto } from './dto/getPosts.dto.js'
import { BaseException } from '../common/interceptors/BaseException.js';
import { UpdatePostDto } from './dto/updatePost.dto.js'
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
  async updatePost(
    userId: number, 
    projectId: number, 
    postId: number, 
    dto: UpdatePostDto
  ) {
    // 1. 게시글 존재 여부 및 작성자 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new BaseException('해당 게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. 보안 검사: 게시글이 해당 프로젝트 소속인지 + 작성자가 본인인지
    if (post.projectId !== projectId) {
      throw new BaseException('잘못된 프로젝트 경로입니다.', HttpStatus.BAD_REQUEST);
    }

    if (post.userId !== userId) { // 스키마의 작성자 필드명(authorId) 확인
      throw new BaseException('수정 권한이 없습니다. 본인만 수정 가능합니다.', HttpStatus.FORBIDDEN);
    }

    // 3. 수정 진행
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...dto, // title, content 중 들어온 값만 업데이트
      },
    });

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "게시글 수정 작업 완료했습니다.",
      timeStamp: new Date()
    };
  }

  async deletePost(userId: number, projectId: number, postId: number) {
    // 1. 게시글 존재 여부 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new BaseException('해당 게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. 보안 검증: 해당 프로젝트의 게시글이 맞는지 확인
    if (post.projectId !== projectId) {
      throw new BaseException('잘못된 접근입니다.', HttpStatus.BAD_REQUEST);
    }

    // 3. 권한 검증: 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new BaseException('삭제 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    // 4. 삭제 수행
    await this.prisma.post.delete({
      where: { id: postId },
    });

    return
  }
}
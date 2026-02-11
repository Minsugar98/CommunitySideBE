import { Injectable,HttpStatus } from '@nestjs/common';
import { CreateCommentDto } from './dto/createComment.dto.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { BaseException } from '../common/interceptors/BaseException.js';
import { GetCommentsDto } from './dto/getComment.dto.js'
import { UpdateCommentDto } from './dto/updateComment.dto.js'
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
  async findAllByPostComment(projectId: number, postId: number, query: GetCommentsDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // 1. 게시글 검증 (해당 프로젝트의 글이 맞는지)
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { projectId: true }
    });

    if (!post || post.projectId !== projectId) {
      throw new BaseException('게시글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 2. 댓글 조회 및 카운트
    const [total, comments] = await Promise.all([
      this.prisma.comment.count({ where: { postId } }),
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' }, // 댓글은 보통 등록순(오래된 순)으로 봅니다.
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              // profileImage: true
            }
          }
        }
      })
    ]);

    return {
      comments,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    };
  }
  async updateComment(
    userId: number,
    projectId: number,
    postId:number,
    commentId: number,
    dto: UpdateCommentDto,
  ) {
    // 1. 댓글 존재 여부 및 게시글/프로젝트 연관 정보 조회
    // 1. 댓글 조회 (게시글 정보 포함)
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            id: true,
            projectId: true, // 프로젝트 경로 검증용
          },
        },
      },
    });
  
    // 2. 존재 여부 및 계층 구조 검증
    if (!comment) {
      throw new BaseException('해당 댓글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
  
    // 게시글이 존재하지 않거나, URL의 postId와 실제 댓글의 postId가 다른 경우
    if (!comment.post || comment.postId !== postId) {
      throw new BaseException('게시글 정보가 일치하지 않습니다.', HttpStatus.BAD_REQUEST);
    }
  
    // URL의 projectId와 실제 게시글의 projectId가 다른 경우
    if (comment.post.projectId !== projectId) {
      throw new BaseException('잘못된 프로젝트 경로입니다.', HttpStatus.BAD_REQUEST);
    }
  
    // 3. 권한 검증: 작성자 본인 확인
    if (comment.userId !== userId) {
      throw new BaseException('댓글 수정 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }
  
    // 4. 수정 실행
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
    });

    return
  }

  async deleteComment(
    userId: number,
    projectId: number,
    postId: number,
    commentId: number,
  ) {
    // 1. 댓글 및 연관 게시글 정보 조회
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { projectId: true }
        }
      }
    });


    // 게시글 정보가 유효하지 않거나 경로가 다른 경우
    if (!comment?.post || comment?.postId !== postId) {
      throw new BaseException('게시글 정보가 일치하지 않습니다.', HttpStatus.BAD_REQUEST);
    }

    // 2. 존재 여부 및 계층 구조(프로젝트, 게시글) 검증
    if (!comment) {
      throw new BaseException('해당 댓글을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    
    

    // 프로젝트 경로가 다른 경우
    if (comment.post.projectId !== projectId) {
      throw new BaseException('잘못된 프로젝트 경로입니다.', HttpStatus.BAD_REQUEST);
    }

    // 3. 권한 검증: 작성자 본인인지 확인
    if (comment.userId !== userId) {
      throw new BaseException('댓글 삭제 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    // 4. 삭제 수행
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return
  }
}
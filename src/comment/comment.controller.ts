import { Controller,Post,Get,Patch,Query,Delete,UseGuards,HttpCode,Req,Param,Body,ParseIntPipe,HttpStatus} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../project/guards/project-member.guard.js'
import {CommentService} from './comment.service.js'
import { CreateCommentDto } from './dto/createComment.dto.js'
import { GetCommentsDto } from './dto/getComment.dto.js'
import { UpdateCommentDto } from './dto/updateComment.dto.js'

@Controller('project/:projectId/posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ProjectMemberGuard) // 프로젝트 멤버인지 확인
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = user.id
    await this.commentService.createComment(
      userId,
      projectId,
      postId,
      createCommentDto,
    );
    return {
      success: true,
      statusCode : HttpStatus.CREATED,
      data : '댓글이 작성되었습니다.',
      timeStamp: new Date()
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  @HttpCode(HttpStatus.OK)
  async getComments(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: GetCommentsDto,
  ) {
    const data = await this.commentService.findAllByPostComment(projectId, postId, query);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "댓글 목록 조회를 완료했습니다.",
      data: data,
      timeStamp: new Date()
    };
  }

  @Patch(':commentId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userId = user.id;
    await this.commentService.updateComment(userId, projectId,postId, commentId, updateCommentDto);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "댓글 수정 작업 완료했습니다.",
      timeStamp: new Date()
    };
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    const userId = user.id;
     await this.commentService.deleteComment(userId, projectId, postId, commentId);
     
     return{
      success: true,
      statusCode: HttpStatus.OK,
      message: "댓글 삭제 작업 완료했습니다.",
      timeStamp: new Date()
    }
  }
}
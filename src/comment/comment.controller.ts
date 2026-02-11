import { Controller,Post,UseGuards,HttpCode,Req,Param,Body,ParseIntPipe,HttpStatus} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../project/guards/project-member.guard.js'
import {CommentService} from './comment.service.js'
import { CreateCommentDto } from './dto/createComment.dto.js'

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
}
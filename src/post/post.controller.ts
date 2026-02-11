import { Controller,HttpStatus,Logger,Post,UseGuards,HttpCode,Req,Param,Body,ParseIntPipe } from '@nestjs/common';
import { PostService } from './post.service.js';
import { CreatePostDto } from './dto/create-Post.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../project/guards/project-member.guard.js'
@Controller('project/post')
export class PostController {
  private readonly logger = new Logger(PostController.name)
  constructor(private readonly postService: PostService) {}


  @Post(':projectId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard) // 👈 여기서 유저 인증 및 멤버 여부 자동 검증
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    await this.postService.createPost(user.id, projectId, createPostDto);

    return {
      success: true,
      statusCode : HttpStatus.OK,
      data : '게시글이 작성되었습니다.',
      timeStamp: new Date()
    }
  }
  
}

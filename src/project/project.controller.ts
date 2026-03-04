import { Req,Controller,Query,HttpCode,Logger,Post,HttpExceptionBodyMessage,HttpStatus,UseGuards, Body, Param, ParseIntPipe, Get, Patch} from '@nestjs/common';
import { ProjectService } from './project.service.js'
import { ProjectCreateDto } from './dto/projectCreate.dto.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PatchApplicationDto } from './dto/projectApplication.dto.js'
import { EditProjectDto } from './dto/editProject.dto.js'
import { GetProjectsDto } from './dto/getProject.dto.js'
import { CreateApplicationDto  } from './dto/createApplication.dto.js'

@Controller('project')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name)
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async projectCreate(@Req() {user}:any,@Body() projectCreateDto: ProjectCreateDto){
    const userId = user.id
    await this.projectService.projectCreate(userId, projectCreateDto)

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '게시글 작성했습니다.',
      timeStamp: new Date(),
    };
  }

  @Post(':projectId/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async projectJoin(
    @Req() {user}:any,
    @Param('projectId',ParseIntPipe) projectId: number,
    @Body() createApplicationDto: CreateApplicationDto // 💡 DTO 추가
    ){
    const userId = user.id
    // this.logger.error(userId,projectId)
    await this.projectService.projectJoin(userId, projectId,createApplicationDto)
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '프로젝트 참여 신청이 완료되었습니다..',
      timeStamp: new Date(),
    };
  }

  @Get(':projectId/projectapplication')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async GetProjectApplication(@Req() {user}:any, @Param('projectId',ParseIntPipe) projectId:number){
    const userId = user.id
    const data = await this.projectService.getApplication(userId,projectId)

    return { 
      success: true,
      statusCode : HttpStatus.OK,
      data : data,
      timeStamp: new Date()
    }
  }

  @Patch(':projectId/application')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async patchProjectApplication(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() patchApplicationDto: PatchApplicationDto,
  ) {
    // 현재 로그인한 사람(user.id)이 리더여야 합니다.
      await this.projectService.patchProjectApplication(
      user.id,
      projectId,
      patchApplicationDto,
    );

    return {
      success:true,
      statusCode : HttpStatus.OK,
      message : patchApplicationDto.status+'작업 완료했습니다.',
      timeStamp: new Date()
    }
  }

  @Patch(':projectId/edit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async editProject(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() editProjectDto: EditProjectDto,
  ) {
    // 로그인한 유저의 ID와 수정을 원하는 프로젝트 ID를 전달
    await this.projectService.editProject(user.id, projectId, editProjectDto);

    return {
      success:true,
      statusCode: HttpStatus.OK,
      message: "수정 작업 완료했습니다.",
      timeStamp: new Date()
    }
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProjects(@Query() query: GetProjectsDto) {
    const data = await this.projectService.findAll(query);
    
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "프로젝트 목록 조회를 완료했습니다.",
      data: data, // 조회된 프로젝트 리스트와 페이지 정보
      timeStamp: new Date()
    };
  }
  @Get('my/applications/pending')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyPendingApplications(
    @Req() { user }: any,
    @Query() query: GetProjectsDto, // 기존에 만든 페이지네이션 DTO 재사용
  ) {
    const data = await this.projectService.findMyPendingApplications(user.id, query);
    
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "승인 대기 중인 프로젝트 목록을 조회했습니다.",
      data: data,
      timeStamp: new Date(),
    };
  }

  @Get('my/projects/active')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyActiveProjects(
    @Req() { user }: any,
    @Query() query: GetProjectsDto,
  ) {
    const data = await this.projectService.findMyActiveProjects(user.id, query);
    
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "현재 참여 중인 프로젝트 목록을 조회했습니다.",
      data: data,
      timeStamp: new Date(),
    };
  }

  @Get(':projectId')
  @HttpCode(HttpStatus.OK)
  async getProjectFind(
    @Param('projectId', ParseIntPipe) projectId: number,
  ){
    const data = await this.projectService.findProjects(projectId)
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: "프로젝트 조회 완료했습니다.",
      data: data,
      timeStamp: new Date(),
    }
  }
}

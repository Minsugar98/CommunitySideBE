// src/task/task.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Param,
  Req,
  HttpStatus,
  Patch,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service.js';
import { CreateTaskDto } from './dto/taskCreate.dto.js';
import { UpdateTaskDto } from './dto/updateTask.dto.js'
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../project/guards/project-member.guard.js';
import { Logger } from '@nestjs/common';

@Controller('project/:projectId/tasks')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ProjectMemberGuard) // 🔒 모든 요청에 대해 인증 및 멤버 권한 확인
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const userId = user.id;
    const res = await this.taskService.createTask(userId, projectId, createTaskDto);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '일정 등록이 되었습니다.',
      data : res,
      timeStamp: new Date(),
    };
  }


  @Get('me') // 실제 경로: /project/:projectId/tasks/me
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  async getMyTasksInProject(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    // 해당 프로젝트 내에서 나의 것만 필터링
    const data = await this.taskService.findMyTasksByProject(projectId, user.id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '일정 조회를 완료했습니다.',
      data: data,
      timeStamp: new Date(),
    };
  }
  
  // 캘린더용 조회 API: /tasks/calendar?projectId=1&year=2026&month=2
  @Get()
  @UseGuards(JwtAuthGuard, ProjectMemberGuard) // 🔒 모든 요청에 대해 인증 및 멤버 권한 확인
  @HttpCode(HttpStatus.OK)
  async getCalendar(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    const userId = user.id;
    const data = await this.taskService.getTasksByMonth(
      userId,
      projectId,
      year,
      month,
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '일정 조회를 완료했습니다.',
      data: data,
      timeStamp: new Date(),
    };
  }

  @Get(':taskId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  @HttpCode(HttpStatus.OK)
  async TaskFindBy(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    const userId = user.id;
    const data = await this.taskService.taskFindBy(userId, taskId, projectId);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '일정 조회를 완료했습니다.',
      data: data,
      timeStamp: new Date(),
    };
  }
  @Patch(':taskId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  async updateTask(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const userId = user.id;
    const updatedTask = await this.taskService.updateTask(
      userId,
      projectId,
      taskId,
      updateTaskDto,
    );

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '일정이 수정되었습니다.',
      data: updatedTask,
    };
  } 

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  @HttpCode(HttpStatus.OK)
  async deleteTask(
    @Req() { user }: any,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    const userId = user.id;
    await this.taskService.deleteTask(userId, projectId, taskId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: '일정 삭제 작업 완료했습니다.',
      timeStamp: new Date(),
    };
  }

}

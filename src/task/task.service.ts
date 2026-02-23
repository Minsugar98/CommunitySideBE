// src/task/task.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/taskCreate.dto.js';
import { BaseException } from '../common/interceptors/BaseException.js';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: number, projectId: number, dto: CreateTaskDto) {
    const { startDate, dueDate, assignedToId, ...rest } = dto;

    const membership = await this.prisma.projectApplication.findFirst({
      where: {
        userId: assignedToId,
        projectId: projectId,
        Status: 'ACCEPTED', // 💡 상태가 ACCEPTED여야 함
      },
    });

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    const isLeader = project?.leaderId === userId;

    if (!membership && !isLeader) {
      throw new BaseException(
        '해당 사용자는 이 프로젝트의 승인된 멤버 또는 리더가 아닙니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 1. 날짜 유효성 검사 (시작일이 종료일보다 늦을 수 없음)
    if (startDate && dueDate) {
      if (new Date(startDate) > new Date(dueDate)) {
        throw new BaseException(
          '시작일은 마감일(종료일)보다 빠를 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // 2. Task 생성
    return await this.prisma.task.create({
      data: {
        ...rest,
        // 날짜 처리
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,

        projectId: projectId,

        assignedToId: assignedToId || null,
      },
    });
  }

  // 캘린더 조회를 위한 한 달치 데이터 가져오기 예시
  async getTasksByMonth(
    userId: number,
    projectId: number,
    year: number,
    month: number,
  ) {
    const membership = await this.prisma.projectApplication.findFirst({
      where: {
        userId: userId,
        projectId: projectId,
        Status: 'ACCEPTED', // 💡 상태가 ACCEPTED여야 함
      },
    });

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    const isLeader = project?.leaderId === userId;

    if (!membership && !isLeader) {
      throw new BaseException(
        '해당 사용자는 이 프로젝트의 승인된 멤버 또는 리더가 아닙니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return await this.prisma.task.findMany({
      where: {
        projectId,
        OR: [
          { startDate: { gte: start, lte: end } },
          { dueDate: { gte: start, lte: end } },
        ],
      },
      orderBy: { startDate: 'asc' },
      include: {
        assignedTo: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async taskFindBy(userId: number, taskId: number, projectId: number) {
    const membership = await this.prisma.projectApplication.findFirst({
      where: {
        userId: userId,
        projectId: projectId,
        Status: 'ACCEPTED', // 💡 상태가 ACCEPTED여야 함
      },
    });

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    });

    const isLeader = project?.leaderId === userId;

    if (!membership && !isLeader) {
      throw new BaseException(
        '해당 사용자는 이 프로젝트의 승인된 멤버 또는 리더가 아닙니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const data = await this.prisma.task.findFirst({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!data) {
      throw new BaseException('등록된 일정이 없습니다.', HttpStatus.NOT_FOUND);
    }
    return data;
  }

  async deleteTask(userId: number, projectId: number, taskId: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (project?.leaderId !== userId) {
      throw new BaseException('권한이 없습니다.', HttpStatus.UNAUTHORIZED);
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });
    return;
  }
}

import { Injectable,Logger,HttpStatus } from '@nestjs/common';
import { ProjectCreateDto } from './dto/projectCreate.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseException } from '../common/interceptors/BaseException.js';
import { PatchApplicationDto } from './dto/projectApplication.dto.js'
import { EditProjectDto} from './dto/editProject.dto.js'
import { GetProjectsDto } from './dto/getProject.dto.js'
@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name)
  constructor(private readonly prisma: PrismaService) {}

  async projectCreate(userId: number, projectCreateDto:ProjectCreateDto): Promise<void>{
    const Project = await this.prisma.project.create({
      data : {...projectCreateDto,leaderId: userId}
    })
    if(!Project){
      throw new BaseException('프로젝트 생성 도중에 문제가 발생했습니다.',HttpStatus.BAD_REQUEST)
    }
    
    }
  
    async projectJoin(userId:number, projectId:number){

      const projectData = await this.prisma.project.findUnique({
        where:{id:projectId},
      })
      const isJoin = await this.prisma.projectApplication.findFirst({
        where: {
            userId: userId,
            projectId: projectId,
        },
      });
      if(isJoin){
        throw new BaseException('이미 신청한 프로젝트 입니다.',HttpStatus. BAD_REQUEST)
      }
      if(!projectData){
        throw new BaseException('존재하는 프로젝트가 없습니다.',HttpStatus.NOT_FOUND)
      }
      if(projectData.leaderId==userId){
        throw new BaseException('본인 프로젝트에 참여할 수 없습니다.',HttpStatus.BAD_REQUEST)
      }
      

      
      await this.prisma.projectApplication.create({
        data: {
          userId,projectId
        }
      })
    }
    async getApplication(userId:number, projectId:number){
      const projectData = await this.prisma.project.findUnique({
        where:{
          id:projectId,
          leaderId:userId
        }
      })
      this.logger.error(projectData)
      if(!projectData){
        throw new BaseException('접근 권한이 없습니다.', HttpStatus.UNAUTHORIZED)
      }
      const data = this.prisma.projectApplication.findMany({
        where:{
          projectId,
          Status:"PENDING"
        }
      })
      return data

    }
    async patchProjectApplication(
      leaderId: number,
      projectId: number,
      dto: PatchApplicationDto,
    ) {
      // 1. 프로젝트 리더 권한 확인
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { leaderId: true },
      });
    
      if (!project) {
        throw new BaseException('존재하지 않는 프로젝트입니다.', HttpStatus.NOT_FOUND);
      }
    
      if (project.leaderId !== leaderId) {
        throw new BaseException('승인/거절 권한이 없습니다.', HttpStatus.FORBIDDEN);
      }
    
      // 2. 해당 지원 내역 찾기 및 업데이트

      try {
        const updatedApplication = await this.prisma.projectApplication.update({
          where: {
            userId_projectId: { // 복합 유니크 키 활용
              userId: dto.userId,
              projectId: projectId,
            },
          },
          data: {
            Status: dto.status, // "ACCEPTED" 또는 "REJECTED" 문자열 저장
          },
        });
    
        return updatedApplication;
      } catch (error) {
        // 지원 내역이 없는 경우 (Prisma 에러 P2025)
        throw new BaseException('지원 내역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }
    }

    async editProject(userId: number, projectId: number, dto: EditProjectDto) {
      // 1. 수정 권한 확인 (리더인지 체크)
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { leaderId: true },
      });
    
      if (!project) {
        throw new BaseException('프로젝트를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }
    
      if (project.leaderId !== userId) {
        throw new BaseException('프로젝트 수정 권한이 없습니다.', HttpStatus.FORBIDDEN);
      }
    
      // 2. 데이터 업데이트
      // Prisma의 update는 dto에 포함된 필드만 수정하고, undefined인 필드는 무시합니다.
      try {
        const updatedProject = await this.prisma.project.update({
          where: { id: projectId },
          data: {
            ...dto, // title, summary, content, position, techStacks 등
          },
        });
    
        return updatedProject;
      } catch (error) {
        throw new BaseException('프로젝트 수정 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    async findAll(query: GetProjectsDto) {
      const { page = 1, limit = 10,  status, position, techStack } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    
    ...(status !== undefined && { status }),

    // 💡 여러 포지션 중 하나라도 배열에 들어있는지 확인 (hasSome)
    ...(position && position.length > 0 && {
      position: { hasSome: position },
    }),

    // 💡 여러 기술 스택 중 하나라도 배열에 들어있는지 확인 (hasSome)
    ...(techStack && techStack.length > 0 && {
      techStacks: { hasSome: techStack },
    }),
  };
    
      const [total, projects] = await Promise.all([
        this.prisma.project.count({ where }),
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            leader: {
              select: { nickname: true, bio: true }
            }
          }
        }),
      ]);
    
      return {
        projects,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit) // 무한스크롤 시 다음 페이지 존재 여부
        }
      };
    }
    
    async findMyPendingApplications(userId: number, query: GetProjectsDto) {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;
    
      // 1. 조건 설정: 로그인한 유저 ID + 상태가 'PENDING'
      const where = {
        userId: userId,
        Status: 'PENDING', // DB 필드명 대문자 Status 확인!
      };
    

      const [total, applications] = await Promise.all([
        this.prisma.projectApplication.count({ where }),
        this.prisma.projectApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }, // 최신 신청 순서대로
          include: {
            project: {
              select: {
                id: true,
                title: true,
                summary: true,
                techStacks: true,
                status: true, // 프로젝트 자체의 모집 상태
              },
            },
          },
        }),
      ]);
    
      return {
        applications,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    }

    async findProjects(projectId:number) {
      const data = await this.prisma.project.findUnique({
        where:{
          id:projectId
        }
      })

      if(!data){
        throw new BaseException('존재하는 프로젝트가 없습니다.',HttpStatus.NOT_FOUND)
      }
      return data;
    }
    async findMyActiveProjects(userId: number, query: GetProjectsDto) {
      const { page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;
    
      // 💡 핵심 로직: 내가 리더이거나 OR 승인된 멤버인 프로젝트 조회
      const where = {
        OR: [
          { leaderId: userId }, // 내가 리더인 경우
          {
            projectApplications: {
              some: {
                userId: userId,
                Status: 'ACCEPTED', // 멤버로 승인된 경우
              },
            },
          },
        ],
      };
    
      const [total, projects] = await Promise.all([
        this.prisma.project.count({ where }),
        this.prisma.project.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            leader: {
              select: { nickname: true }
            },
            // 필요한 경우 프로젝트의 다른 정보(채팅방 유무 등)도 include 가능
          },
        }),
      ]);
    
      return {
        projects,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    }
}

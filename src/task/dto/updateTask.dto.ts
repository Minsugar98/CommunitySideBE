import { IsString, IsOptional, IsEnum, IsDateString,IsInt } from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  // 💡 이 부분이 빠져있어서 에러가 난 것입니다!
  @IsInt() // 숫자인지 확인
  @IsOptional()
  assignedToId?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
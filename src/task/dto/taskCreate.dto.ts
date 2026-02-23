import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string; // 💡 시작일 (선택)

  @IsDateString()
  @IsOptional()
  dueDate?: string; // 💡 종료일/마감일 (선택)

  @IsInt()
  @IsOptional()
  assignedToId: number;
}

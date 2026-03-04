// src/project/dto/get-projects.dto.ts
import { IsArray,IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type,Transform} from 'class-transformer';

export class GetProjectsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString() // ENUM 대신 일반 문자열로 검증
  meetingType?: string;
  
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  status?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // 하나만 와도 배열로 변환
  position?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  techStack?: string[];
}
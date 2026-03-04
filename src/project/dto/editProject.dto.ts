import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class EditProjectDto {
  @IsString() @IsOptional()
  title?: string;

  @IsString() @IsOptional()
  summary?: string;

  @IsString() @IsOptional()
  content?: string;

  @IsArray() @IsString({ each: true }) @IsOptional()
  position?: string[];

  @IsArray() @IsString({ each: true }) @IsOptional()
  techStacks?: string[];

  @IsBoolean() @IsOptional()
  status?: boolean; // 모집 완료 시 false로 변경 가능

  @IsString() @IsOptional()
  startDate?: string;

  @IsString() @IsOptional()
  endDate?: string;
}
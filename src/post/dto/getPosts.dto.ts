import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1; // 기본값 설정

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10; // 기본값 설정

  @IsOptional()
  @IsString()
  keyword?: string; // 제목이나 내용 검색용
}
import { IsString,IsOptional,IsArray,IsNumber } from 'class-validator';

export class UserEditDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  career?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // 배열 내부 요소가 문자열인지 확인
  urlLinks?: string[];
}
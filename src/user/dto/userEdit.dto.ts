import {
  IsOptional,
  MinLength,
  IsString,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

export class UserEditDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber({}, { message: '경력은 숫자만 입력 가능합니다.' })
  @Min(0, { message: '경력은 0 이상의 숫자여야 합니다.' })
  career?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urlLinks?: string[];

  // 비밀번호 수정 필드 추가
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password?: string;
}

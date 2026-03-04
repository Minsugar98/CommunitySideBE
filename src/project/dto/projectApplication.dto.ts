import { IsString, IsInt, IsIn, IsOptional } from 'class-validator';

export class PatchApplicationDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsIn(['ACCEPTED', 'REJECTED']) 
  @IsOptional()
  status?: string;

  // 💡 이 부분을 추가해야 프론트에서 보내는 position을 허용합니다!
  @IsString()
  @IsOptional()
  position?: string; 
}
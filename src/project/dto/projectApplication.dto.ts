import { IsString, IsInt, IsIn } from 'class-validator';

export class PatchApplicationDto {
  @IsInt()
  userId: number; // 상태를 바꿀 지원자의 ID

  @IsString()
  @IsIn(['ACCEPTED', 'REJECTED']) // 허용할 문자열을 제한합니다.
  status: string; 
}
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500) // 댓글 길이를 제한하는 것이 서버 부하 방지에 좋습니다.
  content: string;
}
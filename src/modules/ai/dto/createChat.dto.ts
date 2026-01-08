import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1. History 내부의 'parts' 구조 정의
class ChatPart {
  @IsString()
  text: string;
}

// 2. History 아이템 하나하나의 구조 정의
class ChatHistoryItem {
  @IsString()
  @IsIn(['user', 'model']) // role은 user 또는 model만 허용
  role: 'user' | 'model';

  @IsArray()
  @ValidateNested({ each: true }) // 배열 내부까지 검사
  @Type(() => ChatPart)
  parts: ChatPart[];
}

// 3. 실제 API 요청 DTO
export class CreateChatDto {
  @IsString()
  message: string; // 필수: 사용자 질문

  @IsOptional() // 선택: 첫 질문엔 없을 수 있음
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItem)
  history?: ChatHistoryItem[]; // 이전 대화 기록
}

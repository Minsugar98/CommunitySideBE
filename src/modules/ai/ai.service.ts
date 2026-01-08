import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

// 대화 히스토리 타입 정의 (새로운 SDK 규격에 맞춤)
export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY가 설정되지 않았습니다.',
      );
    }

    // 1. GoogleGenAI 클라이언트 초기화
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 대화형 채팅 메서드
   * @param message 사용자가 입력한 현재 메시지
   * @param history Redis 등에서 가져온 이전 대화 목록
   */
  async chat(message: string, history: ChatHistoryItem[] = []) {
    try {
      // 2. 채팅 세션 생성 (gemini-2.0-flash 모델 사용)
      const chat = this.ai.chats.create({
        model: 'gemini-2.5-flash-lite', // 요청하신 모델
        history: history,
        config: {
          maxOutputTokens: 1000,
        },
      });

      // 3. 메시지 전송
      // 주의: 새로운 SDK는 sendMessage 인자가 객체 형태({ message: ... })입니다.
      const result = await chat.sendMessage({
        message: message,
      });

      // 4. 응답 텍스트 반환
      // 새로운 SDK는 result.text 로 바로 접근 가능합니다.
      return result.text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new InternalServerErrorException(
        'AI 응답 생성 중 오류가 발생했습니다.',
      );
    }
  }
}

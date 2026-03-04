import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';

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
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          systemInstruction: {
            text: `# Role
// 너는 10년 차 시니어 서비스 기획자이자 풀스택 개발자이다.
// 비즈니스 로직의 실현 가능성과 기술적 구현 난이도(DB 설계, API 통신, 인프라 등)를 동시에 고려하여 최적의 솔루션을 제공한다.

// # Context
// 사용자는 기획에 도움이 필요한 개발자, 디자이너, 또는 기획자이다.
// 너는 사용자의 아이디어를 구체화하고, 기술적 검토가 포함된 전략적인 조언을 제공해야 한다.

// # Strict Rules
// 1. **Language**: 모든 답변은 한국어로만 작성한다.
// 2. **Terminology**: 전문 용어 사용 시 반드시 괄호나 별도 설명을 통해 보충 설명을 덧붙인다.
// 3. **Conciseness**: 'description'에 들어가는 문장은 최대 2문장 이내로 제한한다, 기획에 대한 다음 진행에 대한 질문을 마지막에 추가한다. (단, '정리 요청 및 지금까지의 대회에 대한 기획내용을 정리 요청'시에는 이 제한을 무시하고 상세히 요약한다.)
// 4. **Privacy & Security**: 대화 중 언급된 다른 사용자의 아이디어나 기획 내용은 절대 외부에 노출하거나 다른 사용자에게 언급하지 않는다.
// 5. **Flow Control**: 사용자의 이전 맥락을 모두 기억하며, 질문에 대한 답변이 완료되면 반드시 다음 단계(Next Step)를 제안하여 기획을 진전시킨다.
// 6. **Output Constraint**: 모든 응답은 반드시 아래 정의된 JSON 형식으로만 출력하며, JSON 외의 텍스트는 포함하지 않는다.

// # Output Format (JSON Only)
// {
//   "status": "HTTP 상태 코드 (예: 200, 400 등)",
//   "description": "기획적/기술적 조언 (최대 3문장, 정리 요청 시 제한 없음)",
//   "result": [
//     "추천 후보 1 (구체적인 아이디어나 기술 스택 이나, 짧은 1문장으로 이해할 수 있는 수준의 내용 (단 한번에 모든 내용을 제공 할 필요는 없음,  단계별로 아이디어, 기술스택 등을 추천해주면 된다.))",
//     "추천 후보 2",
//     "추천 후보 3"
//   ]
// }`,
          },
          responseSchema: {
            type: Type.OBJECT,
            required: ['description', 'status', 'result'],
            properties: {
              description: {
                type: Type.STRING,
              },
              status: {
                type: Type.NUMBER,
              },
              result: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
          },
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

// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { GoogleGenAI, Type, Tool } from '@google/genai';

// // 대화 히스토리 타입 정의 (새로운 SDK 규격에 맞춤)
// export interface ChatHistoryItem {
//   role: 'user' | 'model';
//   parts: { text: string }[];
// }

// @Injectable()
// export class GeminiService {
//   private ai: GoogleGenAI;
//   private readonly tools: Tool[];
//   private readonly systemInstruction: { text: string }[];
//   private readonly responseSchema: any;

//   constructor(private readonly configService: ConfigService) {
//     const apiKey = this.configService.get<string>('GEMINI_API_KEY');
//     if (!apiKey) {
//       throw new InternalServerErrorException(
//         'GEMINI_API_KEY가 설정되지 않았습니다.',
//       );
//     }

//     // 1. GoogleGenAI 클라이언트 초기화
//     this.ai = new GoogleGenAI({ apiKey });

//     // Initialize tools for the model
//     this.tools = [
//       {
//         googleSearch: {},
//       },
//     ];

//     // Initialize response schema for structured output
//     this.responseSchema = {
//       type: Type.OBJECT,
//       required: ['description', 'status', 'result'],
//       properties: {
//         description: {
//           type: Type.STRING,
//         },
//         status: {
//           type: Type.NUMBER,
//         },
//         result: {
//           type: Type.ARRAY,
//           items: {
//             type: Type.STRING,
//           },
//         },
//       },
//     };

//     // Initialize system instruction for defining the AI's role and rules
//     this.systemInstruction = [
//       {
//         text: `# Role
// 너는 10년 차 시니어 서비스 기획자이자 풀스택 개발자이다.
// 비즈니스 로직의 실현 가능성과 기술적 구현 난이도(DB 설계, API 통신, 인프라 등)를 동시에 고려하여 최적의 솔루션을 제공한다.

// # Context
// 사용자는 기획에 도움이 필요한 개발자, 디자이너, 또는 기획자이다.
// 너는 사용자의 아이디어를 구체화하고, 기술적 검토가 포함된 전략적인 조언을 제공해야 한다.

// # Strict Rules
// 1. **Language**: 모든 답변은 한국어로만 작성한다.
// 2. **Terminology**: 전문 용어 사용 시 반드시 괄호나 별도 설명을 통해 보충 설명을 덧붙인다.
// 3. **Conciseness**: 'description'에 들어가는 문장은 최대 3문장 이내로 제한한다. (단, '정리 요청' 시에는 이 제한을 무시하고 상세히 요약한다.)
// 4. **Privacy & Security**: 대화 중 언급된 다른 사용자의 아이디어나 기획 내용은 절대 외부에 노출하거나 다른 사용자에게 언급하지 않는다.
// 5. **Flow Control**: 사용자의 이전 맥락을 모두 기억하며, 질문에 대한 답변이 완료되면 반드시 다음 단계(Next Step)를 제안하여 기획을 진전시킨다.
// 6. **Output Constraint**: 모든 응답은 반드시 아래 정의된 JSON 형식으로만 출력하며, JSON 외의 텍스트는 포함하지 않는다.

// # Output Format (JSON Only)
// {
//   "status": "HTTP 상태 코드 (예: 200, 400 등)",
//   "description": "기획적/기술적 조언 (최대 3문장, 정리 요청 시 제한 없음)",
//   "result": [
//     "추천 후보 1 (구체적인 아이디어나 기술 스택 등)",
//     "추천 후보 2",
//     "추천 후보 3"
//   ]
// }`,
//       },
//     ];
//   }

//   /**
//    * 대화형 채팅 메서드
//    * @param message 사용자가 입력한 현재 메시지
//    * @param history Redis 등에서 가져온 이전 대화 목록
//    */
//   async chat(message: string, history: ChatHistoryItem[] = []) {
//     try {
//       // 2. 채팅 세션 생성 (gemini-2.0-flash 모델 사용)
//       const chat = this.ai.chats.create({
//         model: 'gemini-2.5-flash-lite', // gemini-2.5-flash-lite,  gemini-3-flash-preview

//         history: history,
//         config: {
//           tools: this.tools,
//           systemInstruction: this.systemInstruction,
//           maxOutputTokens: 5000,
//           responseMimeType: 'application/json',
//           responseSchema: this.responseSchema,
//         },
//       });

//       // 3. 메시지 전송
//       // 주의: 새로운 SDK는 sendMessage 인자가 객체 형태({ message: ... })입니다.
//       const result = await chat.sendMessage({
//         message: message,
//       });

//       // 4. 응답 텍스트 반환
//       // 새로운 SDK는 result.text 로 바로 접근 가능합니다.
//       return result.text;
//     } catch (error) {
//       console.error('Gemini API Error:', error); // 에러 로그는 유지합니다.
//       if (error.status === 429) {
//         throw new InternalServerErrorException(
//           'Gemini API 할당량을 초과했습니다. 잠시 후 다시 시도하거나, API 사용량을 확인해주세요.',
//         );
//       }
//       throw new InternalServerErrorException(
//         'AI 응답 생성 중 오류가 발생했습니다.', // 그 외의 일반적인 에러
//       );
//     }
//   }
// }

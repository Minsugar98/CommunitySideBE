import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GeminiService } from './ai.service.js';
import { CreateChatDto } from './dto/createChat.dto.js';

@Controller('gemini') // 주소: /gemini
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('chat') // 주소: POST /gemini/chat
  @HttpCode(HttpStatus.OK)
  async chat(@Body() createChatDto: CreateChatDto) {
    const { message, history } = createChatDto;

    // 서비스 호출 (DTO에서 꺼낸 데이터를 전달)
    const res = await this.geminiService.chat(message, history);

    // 프론트엔드에 응답 (JSON)
    return res;
  }
}

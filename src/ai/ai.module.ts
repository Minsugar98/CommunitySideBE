import { Module } from '@nestjs/common';
import { GeminiController } from './ai.controller.js';
import { GeminiService } from './ai.service.js';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}

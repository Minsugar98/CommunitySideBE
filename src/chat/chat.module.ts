// src/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { ChatGateway } from './chat.gateway.js';
import { AuthModule } from '../auth/auth.module.js'; // AuthModule 경로 확인
import { ProjectModule } from '../project/project.module.js'; // ProjectModule 경로 확인

@Module({
  // 💡 핵심: JwtService를 사용하기 위해 AuthModule을 반드시 import 해야 합니다.
  imports: [AuthModule, ProjectModule], 
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ChatModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { GeminiModule } from './modules/ai/ai.module.js';
import { UserModule } from './modules/user/user.module.js';
@Module({
  imports: [
    // isGlobal: true로 설정하면 다른 모듈에서 별도 import 없이 사용 가능
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    GeminiModule,
    UserModule,
  ],
})
export class AppModule {}

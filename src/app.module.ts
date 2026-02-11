import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { GeminiModule } from './ai/ai.module.js';
import { UserModule } from './user/user.module.js';
import { AllExceptionFilter } from './common/interceptors/AllExceptionFilter.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectController } from './project/project.controller.js';
import { ProjectModule } from './project/project.module.js';
import { PostModule } from './post/post.module.js';
import { CommentModule } from './comment/comment.module.js';

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
    AuthModule,
    ProjectModule,
    PostModule,
    CommentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 💡 1. cookieParser를 CORS보다 먼저 배치 (일부 환경 대응)
  app.use(cookieParser());

  // 💡 2. CORS 설정을 최상단에 배치하고 설정을 강화
  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없거나(Postman 등) localhost인 경우 허용
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
	origin.includes('49.50.134.252')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    optionsSuccessStatus: 200, // 💡 사용자 환경에서 200으로 응답하므로 명시적으로 맞춤
    maxAge: 86400, // 💡 Preflight 응답을 24시간 동안 캐싱하도록 허용 (불필요한 OPTIONS 요청 감소)
  });

  // 1. 전역 유효성 검사 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 제거하고 받음 (보안)
      forbidNonWhitelisted: true, // DTO에 없는 속성이 들어오면 에러 발생
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
    }),
  );

  // 2. Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('My NestJS API')
    .setDescription('API 문서입니다.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api 로 접속 가능

  await app.listen(3001);
}
bootstrap();

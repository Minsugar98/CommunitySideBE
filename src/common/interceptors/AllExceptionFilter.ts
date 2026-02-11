import { Catch, ArgumentsHost, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from './BaseException.js';
import { UnCatchedException } from './UnCatchedException.js';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let res: any;

    if (exception instanceof BaseException) {
      res = exception;
    } else if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      res = {
        statusCode: exception.getStatus(),
        errorCode: (errorResponse as any).error || 'HTTP_EXCEPTION',
        // ValidationPipe의 상세 에러 메시지를 포함시킵니다.
        message: (errorResponse as any).message || exception.message,
      };
    } else {
      // 알 수 없는 에러는 500으로 처리
      res = new UnCatchedException();
    }

    // 서버 콘솔에 상세 에러 로그 출력 (이게 없어서 안 보였던 것임)
    this.logger.error(
      `[${request.method}] ${request.url} >> ${exception instanceof Error ? exception.message : 'Unknown Error'}`,
      exception instanceof Error ? exception.stack : '',
    );

    res.timestamp = new Date().toISOString();
    res.path = request.url;

    response.status(res.statusCode).json({
      errorCode: res.errorCode,
      statusCode: res.statusCode,
      message: res.message, // 메시지 필드 추가
      timestamp: res.timestamp,
      path: res.path,
    });
  }
}

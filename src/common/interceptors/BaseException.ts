
import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  public timestamp: string;
  public path: string;

  constructor(
    message: string,                      // 첫 번째로 메시지
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST, // 기본값 설정
    public readonly errorCode: string = 'COMMON_ERROR',             // 기본값 설정
  ) {

    super({ message, error: errorCode }, statusCode);
  }
}
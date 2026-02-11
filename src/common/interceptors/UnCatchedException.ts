import { HttpStatus } from '@nestjs/common';
import { BaseException } from './BaseException.js'; // BaseException.ts 파일이 같은 경로에 있어야 합니다.

export class UnCatchedException extends BaseException {
  constructor() {
    super(
      'INTERNAL_SERVER_ERROR',
      HttpStatus.INTERNAL_SERVER_ERROR,
      '서버에서 알 수 없는 오류가 발생했습니다.',
    );
  }
}

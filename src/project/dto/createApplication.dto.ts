import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty({ message: '지원 포지션을 선택해주세요.' })
  position: string;

  @IsString()
  @IsNotEmpty({ message: '지원 메시지를 입력해주세요.' })
  @MaxLength(500, { message: '지원 메시지는 500자 이내로 작성해주세요.' })
  message: string;
}
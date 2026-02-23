import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io'; // 👈 npm i socket.io 설치 필요
import { PrismaService } from '../../prisma/prisma.service.js'; // 본인의 경로에 맞게 수정

@Injectable()
export class WssGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}



  
  // src/chat/guards/wss.guard.ts

async canActivate(context: ExecutionContext): Promise<boolean> {
  const client: Socket = context.switchToWs().getClient();
  
  // Params에서 데이터 가져오기
  const token = (client.handshake.query?.token as string)?.replace(/"/g, '');
  const projectIdRaw = (client.handshake.query?.projectId as string)?.replace(/"/g, '');

  if (!token || !projectIdRaw) {
    console.log('❌ [WssGuard] 토큰 또는 프로젝트ID 누락');
    client.disconnect(); // 💡 무한 로딩 방지를 위해 강제 종료
    return false;
  }

  try {
    const user = this.jwtService.verify(token);
    client.data.user = user;

    const projectId = parseInt(projectIdRaw, 10);
    const chatRoom = await this.prisma.chatRoom.findUnique({ where: { projectId } });

    if (!chatRoom) {
      console.log(`⚠️ [WssGuard] DB에 채팅방 없음: ${projectId}`);
      client.disconnect();
      return false;
    }

    console.log(`✅ [WssGuard] 인증 성공: ${user.nickname}`);
    return true;
  } catch (e) {
    console.error('❌ [WssGuard] JWT 인증 실패:', e.message);
    client.disconnect();
    return false;
  }
}
}
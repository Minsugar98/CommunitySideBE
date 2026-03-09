import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

// ... 상단 import 생략

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake.headers.cookie;
    const projectIdRaw = client.handshake.query?.projectId as string;

    try {
      if (!rawCookie || !projectIdRaw) throw new Error('데이터 누락');

      const token = rawCookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];

    if (!token) throw new Error('access_token이 쿠키에 없습니다.');
      const projectId = parseInt(projectIdRaw.replace(/"/g, ''), 10);

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new Error('유저 없음');

      const chatRoom = await this.prisma.chatRoom.findUnique({
        where: { projectId },
      });
      if (!chatRoom) {
        client.disconnect();
        return;
      }

      // 💡 데이터 저장
      client.data.user = user;
      client.data.projectId = projectId;

      // 🔥 [핵심] 연결되자마자 바로 해당 프로젝트 방에 입장시킴!
      const roomName = `project-${projectId}`;
      client.join(roomName);


    } catch (error) {

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ [연결 종료] ID: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = client.data.user;

    // 💡 [수정] 배열 전체를 뒤져서 content가 있는 객체를 찾아냅니다.
    let actualData;
    if (Array.isArray(data)) {
      actualData = data.find((obj) => obj && obj.content) || data[0];
    } else {
      actualData = data;
    }

    const projectId = Number(actualData?.projectId) || client.data.projectId;
    const content = actualData?.content;

    // 최종 검증 로그
    if (!content) {
      console.log('❌ 여전히 content를 찾을 수 없음:', data);
      return;
    }

    try {
      const newMessage = await this.prisma.message.create({
        data: {
          content: content,
          user: { connect: { id: user.id } },
          chatRoom: { connect: { projectId: projectId } },
        },
        include: { user: { select: { id: true, nickname: true } } },
      });

      const roomName = `project-${projectId}`;
      this.server.to(roomName).emit('receiveMessage', newMessage);


    } catch (error) {
      console.error('❌ Prisma 에러:', error.message);
    }
  }
}

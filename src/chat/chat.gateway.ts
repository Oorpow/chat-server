import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';

interface JoinPayload {
  chatroomId: number;
  joinedUserId: number;
}

interface MessagePayload {
  fromUserId: number;
  chatroomId: number;
  message: {
    type: 'text' | 'image';
    content: string;
  };
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('joinChat')
  joinChat(client: Socket, payload: JoinPayload) {
    const chatName = payload.chatroomId.toString();
    client.join(chatName);

    // 向群聊广播，xxx加入了群聊
    this.server.to(chatName).emit('message', {
      type: 'joinChat',
      userId: payload.joinedUserId,
    });
  }

  @SubscribeMessage('sendMsg')
  sendMsg(@MessageBody() payload: MessagePayload) {
    const chatName = payload.chatroomId.toString();
    this.server.to(chatName).emit('message', {
      type: 'sendMsg',
      userId: payload.fromUserId,
      message: payload.message,
    });
  }
}

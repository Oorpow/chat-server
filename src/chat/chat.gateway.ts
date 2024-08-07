import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';

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
  @Inject(ChatHistoryService)
  private chatHistoryService: ChatHistoryService;

  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  /**
   * 加入聊天室
   * @param client
   * @param payload
   */
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

  /**
   * 发送消息，并留存聊天记录(云端漫游)
   * @param payload
   */
  @SubscribeMessage('sendMsg')
  async sendMsg(@MessageBody() payload: MessagePayload) {
    const chatName = payload.chatroomId.toString();

    // 发完消息保存聊天记录
    await this.chatHistoryService.create({
      content: payload.message.content,
      type: payload.message.type === 'image' ? 1 : 0,
      chatroomId: payload.chatroomId,
      fromUserId: payload.fromUserId,
    });

    this.server.to(chatName).emit('message', {
      type: 'sendMsg',
      userId: payload.fromUserId,
      message: payload.message,
    });
  }
}

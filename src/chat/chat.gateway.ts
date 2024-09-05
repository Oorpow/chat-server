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
import { SocketEventName } from 'src/common/enum/event-name.enum';

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
   * 加入聊天室 （广播，显示xx加入了聊天室）
   * @param client
   * @param payload
   */
  @SubscribeMessage(SocketEventName.JoinChat)
  joinChat(client: Socket, payload: JoinPayload) {
    const chatName = payload.chatroomId.toString();
    // NOTE 将客户端加入房间号，后续可以对该房间进行消息传递
    client.join(chatName);

    // 向房间广播，xxx进入了聊天室
    this.server.to(chatName).emit('message', {
      type: SocketEventName.JoinChat,
      userId: payload.joinedUserId,
    });
  }

  /**
   * 发送消息，并留存聊天记录(云端漫游)
   * @param payload
   */
  @SubscribeMessage(SocketEventName.SendMessage)
  async sendMsg(@MessageBody() payload: MessagePayload) {
    const chatName = payload.chatroomId.toString();

    // 发完消息保存聊天记录
    const { id, type } = await this.chatHistoryService.create({
      content: payload.message.content,
      type: payload.message.type === 'image' ? 1 : 0,
      chatroomId: payload.chatroomId,
      fromUserId: payload.fromUserId,
    });

    this.server.to(chatName).emit('message', {
      id,
      type: SocketEventName.SendMessage,
      userId: payload.fromUserId,
      message: { type, content: payload.message.content },
      chatroomId: payload.chatroomId,
    });
  }
}

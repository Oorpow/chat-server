import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatHistoryDto } from './dto/chat-history.dto';

@Injectable()
export class ChatHistoryService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  async list(chatroomId: number) {
    const chatMsgList = await this.prisma.chatHistory.findMany({
      where: { chatroomId },
    });

    const result = [];
    for (let i = 0; i < chatMsgList.length; i++) {
      const chatMsgItem = chatMsgList[i];
      const user = await this.prisma.user.findUnique({
        where: { id: chatMsgItem.fromUserId },
        select: { id: true, username: true, nickname: true },
      });
      result.push({ ...chatMsgItem, user });
    }

    return result;
  }

  async create(history: CreateChatHistoryDto) {
    return this.prisma.chatHistory.create({
      data: history,
    });
  }
}

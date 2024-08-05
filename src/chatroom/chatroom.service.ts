import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HTTPERROR } from 'src/common/enum/http-error.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatroomService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  async createSingle(friendId: number, uid: number) {
    const { id } = await this.prisma.chatroom.create({
      data: {
        name: `chat_${Date.now()}`,
        type: false,
      },
      select: {
        id: true,
      },
    });

    await this.prisma.userChatroom.create({
      data: {
        userId: uid,
        chatroomId: id,
      },
    });
    await this.prisma.userChatroom.create({
      data: {
        userId: friendId,
        chatroomId: id,
      },
    });

    return '私聊创建成功';
  }

  async createGroup(name: string, uid: number) {
    const { id } = await this.prisma.chatroom.create({
      data: {
        name,
        type: true,
      },
    });

    await this.prisma.userChatroom.create({
      data: {
        userId: uid,
        chatroomId: id,
      },
    });

    return '群聊创建成功';
  }

  async getChatroomGroupList(uid: number) {
    const groups = await this.prisma.userChatroom.findMany({
      where: { userId: uid },
      select: { chatroomId: true },
    });
    const groupIds = groups.map((item) => item.chatroomId);

    const groupResult = await this.prisma.chatroom.findMany({
      where: {
        id: {
          in: groupIds,
        },
      },
    });

    const result = [];

    for (let i = 0; i < groupResult.length; i++) {
      const groupItem = groupResult[i];
      const userIds = await this.prisma.userChatroom.findMany({
        where: {
          chatroomId: groupItem.id,
        },
        select: {
          userId: true,
        },
      });
      result.push({
        ...groupItem,
        userNums: userIds.length,
        userIds: userIds.map((item) => item.userId),
      });
    }

    return result;
  }

  async getChatroomMembers(chatroomId: number) {
    const userChatrooms = await this.prisma.userChatroom.findMany({
      where: {
        chatroomId,
      },
    });

    const userIds = userChatrooms.map((item) => item.userId);

    const members = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return members;
  }

  async joinGroup(chatroomId: number, uid: number) {
    const chatroom = await this.prisma.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });

    if (!chatroom.type) {
      throw new BadRequestException(HTTPERROR.SINGLE_GROUP_JOIN_ERROR);
    }

    await this.prisma.userChatroom.create({
      data: {
        userId: uid,
        chatroomId: chatroomId,
      },
    });

    return '加入群聊成功';
  }

  async quitGroup(chatroomId: number, uid: number) {
    const chatroom = await this.prisma.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });

    if (!chatroom.type) {
      throw new BadRequestException(HTTPERROR.SINGLE_GROUP_QUIT_ERROR);
    }

    await this.prisma.userChatroom.deleteMany({
      where: {
        userId: uid,
        chatroomId,
      },
    });

    return '退出群聊成功';
  }
}

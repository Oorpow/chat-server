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
        name: `chat_${new Date().getTime()}`,
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

    return id;
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

      // 私聊的情况下，将聊天室的name替换成对方用户的名称
      if (!groupItem.type) {
        const user = await this.prisma.user.findUnique({
          where: {
            // 私聊的情况下，userIds理应只有2个，排掉自身id后，剩下的就是对方用户的id
            id: userIds.filter((item) => item.userId !== uid)[0].userId,
          },
        });
        groupItem.name = user.username;
      }
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

  async findChat(friendId: number, uid: number) {
    const currentUserInChats = await this.prisma.userChatroom.findMany({
      where: { userId: uid },
    });

    const friendInChats = await this.prisma.userChatroom.findMany({
      where: { userId: friendId },
    });

    let result;
    // 取交集
    for (let i = 0; i < currentUserInChats.length; i++) {
      const chatroom = await this.prisma.chatroom.findFirst({
        where: { id: currentUserInChats[i].chatroomId },
      });
      // 过滤掉群聊
      if (chatroom.type) {
        continue;
      }
      const found = friendInChats.find(
        (item) => item.chatroomId === chatroom.id,
      );
      if (found) {
        result = found.chatroomId;
        break;
      }
    }

    return result;
  }
}

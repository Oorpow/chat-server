import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FriendAddDto } from './dto/friendship.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { STATUS } from 'src/common/enum/status.enum';
import { HTTPERROR } from 'src/common/enum/http-error.enum';

@Injectable()
export class FriendshipService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  async add(friendAddDto: FriendAddDto, uid: number) {
    return await this.prisma.friendRequest.create({
      data: {
        fromUserId: uid,
        toUserId: friendAddDto.friendId,
        reason: friendAddDto.reason,
        status: STATUS.PENDING,
      },
    });
  }

  async getFriends(uid: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: uid,
      },
      include: {
        friends: true,
      },
    });

    const friendIds = user.friends.map((item) => item.friendId);

    return this.prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
    });
  }

  list(uid: number) {
    return this.prisma.friendRequest.findMany({
      where: { fromUserId: uid },
    });
  }

  async agreeFriendRequest(friendId: number, uid: number) {
    try {
      // 同意好友申请
      await this.prisma.friendRequest.updateMany({
        where: {
          fromUserId: friendId,
          toUserId: uid,
          status: STATUS.PENDING,
        },
        data: {
          status: STATUS.RESOLVED,
        },
      });

      const existFriendship = await this.prisma.friendship.findMany({
        where: { userId: uid, friendId },
      });

      // 添加好友关系
      if (!existFriendship.length) {
        await this.prisma.friendship.create({
          data: {
            userId: uid,
            friendId,
          },
        });
      }

      return '添加成功';
    } catch (error) {
      throw new BadRequestException(HTTPERROR.FRIEND_ADD_ERROR);
    }
  }

  async rejectFriendRequest(friendId: number, uid: number) {
    try {
      await this.prisma.friendRequest.updateMany({
        where: {
          fromUserId: friendId,
          toUserId: uid,
          status: STATUS.PENDING,
        },
        data: {
          status: STATUS.REJECTED,
        },
      });

      return '已拒绝';
    } catch (error) {
      throw new BadRequestException(HTTPERROR.FRIEND_REJECT_ERROR);
    }
  }

  async removeFriend(friendId: number, uid: number) {
    await this.prisma.friendship.deleteMany({
      where: {
        userId: uid,
        friendId,
      },
    });

    return '删除成功';
  }
}

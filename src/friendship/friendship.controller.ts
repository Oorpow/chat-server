import { Body, Controller, Get, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { RequiredLogin, UserInfo } from 'src/common/decorator';
import {
  AgreeFriendReqDto,
  FriendAddDto,
  RemoveFriendReqDto,
} from './dto/friendship.dto';

@RequiredLogin()
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  /**
   * 发送好友请求
   * @param friendAddDto
   * @param userId
   */
  @Post('add')
  async add(
    @Body() friendAddDto: FriendAddDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.friendshipService.add(friendAddDto, userId);
  }

  /**
   * 好友列表
   * @param userId 登录用户的id
   */
  @Get('friends')
  async getFriends(@UserInfo('userId') userId: number) {
    return this.friendshipService.getFriends(userId);
  }

  // 获取好友请求列表
  @Get('list')
  async list(@UserInfo('userId') userId: number) {
    return this.friendshipService.list(userId);
  }

  // 同意好友申请，并添加好友关系
  @Post('agree')
  async agreeFriendRequest(
    @Body() agreeFriendReqDto: AgreeFriendReqDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.friendshipService.agreeFriendRequest(
      agreeFriendReqDto.fromUserId,
      userId,
    );
  }

  // 拒绝好友请求
  @Post('reject')
  async rejectFriendRequest(
    @Body() agreeFriendReqDto: AgreeFriendReqDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.friendshipService.rejectFriendRequest(
      agreeFriendReqDto.fromUserId,
      userId,
    );
  }

  // 删除好友
  @Post('remove')
  async removeFriend(
    @Body() removeFriendDto: RemoveFriendReqDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.friendshipService.removeFriend(
      removeFriendDto.friendId,
      userId,
    );
  }
}

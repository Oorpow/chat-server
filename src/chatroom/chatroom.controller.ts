import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { RequiredLogin, UserInfo } from 'src/common/decorator';
import {
  CreateGroupChatroomDto,
  CreateSingleChatroomDto,
  JoinGroupDto,
  QuitGroupDto,
} from './dto/chatroom.dto';

@RequiredLogin()
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  /**
   * 创建私聊
   * @param createSingleChatroomDto
   * @param userId
   * @returns
   */
  @Post('create/single')
  async createSingle(
    @Body() createSingleChatroomDto: CreateSingleChatroomDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.chatroomService.createSingle(
      createSingleChatroomDto.friendId,
      userId,
    );
  }

  /**
   * 创建群聊
   * @param createGroupChatroomDto
   * @param userId
   */
  @Post('create/group')
  async createGroup(
    @Body() createGroupChatroomDto: CreateGroupChatroomDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.chatroomService.createGroup(
      createGroupChatroomDto.name,
      userId,
    );
  }

  /**
   * 查询自己参与的所有聊天，并显示用户数
   * @param userId
   * @returns
   */
  @Get('group/list')
  async getChatroomGroupList(@UserInfo('userId') userId: number) {
    return this.chatroomService.getChatroomGroupList(userId);
  }

  /**
   * 查询群聊里的用户信息
   * @param chatroomId
   * @returns
   */
  @Get('group/members')
  async getChatroomMembers(
    @Query('chatroomId', ParseIntPipe) chatroomId: number,
  ) {
    return this.chatroomService.getChatroomMembers(chatroomId);
  }

  /**
   * 加入群聊
   * @param joinGroupDto
   * @param userId
   * @returns
   */
  @Post('group/join')
  async joinGroup(
    @Body() joinGroupDto: JoinGroupDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.chatroomService.joinGroup(joinGroupDto.chatroomId, userId);
  }

  /**
   * 退出群聊
   * @param quitGroupDto
   * @param userId
   * @returns
   */
  @Post('group/quit')
  async quitGroup(
    @Body() quitGroupDto: QuitGroupDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.chatroomService.quitGroup(quitGroupDto.chatroomId, userId);
  }
}

import { IsNotEmpty } from 'class-validator';

export class CreateSingleChatroomDto {
  @IsNotEmpty()
  friendId: number;
}

export class CreateGroupChatroomDto {
  @IsNotEmpty()
  name: string;
}

export class JoinGroupDto {
  @IsNotEmpty()
  chatroomId: number;
}

export class QuitGroupDto extends JoinGroupDto {}

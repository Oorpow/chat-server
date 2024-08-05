import { IsNotEmpty } from 'class-validator';

export class FriendAddDto {
  @IsNotEmpty()
  friendId: number;

  reason: string;
}

export class AgreeFriendReqDto {
  @IsNotEmpty()
  fromUserId: number;
}

export class RemoveFriendReqDto {
  @IsNotEmpty()
  friendId: number;
}

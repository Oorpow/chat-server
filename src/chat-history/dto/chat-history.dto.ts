import { IsNotEmpty } from 'class-validator';

export class CreateChatHistoryDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  type: number;

  @IsNotEmpty()
  chatroomId: number;

  @IsNotEmpty()
  fromUserId: number;
}

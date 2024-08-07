import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get('list')
  async list(@Query('chatroomId', ParseIntPipe) chatroomId: number) {
    return this.chatHistoryService.list(chatroomId);
  }
}

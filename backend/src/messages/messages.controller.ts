import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

class SendMessageDto {
  @IsString() @IsNotEmpty() content: string;
}

@Controller('messages')
export class MessagesController {
  constructor(private svc: MessagesService) {}

  @Get('order/:orderId/master/:masterId')
  byOrder(
    @Param('orderId') orderId: string,
    @Param('masterId') masterId: string,
  ) {
    return this.svc.findByOrder(orderId, masterId);
  }

  @Post('order/:orderId/master/:masterId')
  send(
    @Param('orderId') orderId: string,
    @Param('masterId') masterId: string,
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.svc.send(orderId, masterId, user.id, dto.content);
  }

  @Post('order/:orderId/master/:masterId/read')
  markRead(
    @Param('orderId') orderId: string,
    @Param('masterId') masterId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.markRead(orderId, masterId, user.id);
  }

  @Get('unread')
  unread(@CurrentUser() user: any) {
    return this.svc.countUnread(user.id);
  }
}

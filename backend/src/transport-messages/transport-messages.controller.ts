import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransportMessagesService } from './transport-messages.service';
import { CurrentUser } from '../common/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

class SendMessageDto {
  @IsString() @IsNotEmpty() content: string;
}

@Controller('transport-messages')
export class TransportMessagesController {
  constructor(private svc: TransportMessagesService) {}

  @Get('order/:orderId/carrier/:carrierId')
  byOrder(
    @Param('orderId') orderId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.svc.findByOrder(orderId, carrierId);
  }

  @Post('order/:orderId/carrier/:carrierId')
  send(
    @Param('orderId') orderId: string,
    @Param('carrierId') carrierId: string,
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.svc.send(orderId, carrierId, user.id, dto.content);
  }

  @Post('order/:orderId/carrier/:carrierId/read')
  markRead(
    @Param('orderId') orderId: string,
    @Param('carrierId') carrierId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.markRead(orderId, carrierId, user.id);
  }

  @Get('unread')
  unread(@CurrentUser() user: any) {
    return this.svc.countUnread(user.id);
  }
}

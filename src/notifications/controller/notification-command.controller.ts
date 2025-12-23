import {
  Controller,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationCommandService, CreateNotificationDto } from '../service/notification-command.service';
import { AuthGuard } from '../../user/guards/auth.guard';
import { UserContext } from '../../user/decorators/user-auth-details.decorator';
import type { AuthPayload } from '../../user/utils/auth.payload';

@ApiTags('Notifications-Commands')
@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationCommandController {
  constructor(
    private readonly notificationCommandService: NotificationCommandService
  ) {}

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') notificationId: string,
    @UserContext() user: AuthPayload
  ) {
    return this.notificationCommandService.markAsRead(notificationId, user);
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@UserContext() user: AuthPayload) {
    return this.notificationCommandService.markAllAsRead(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async deleteNotification(
    @Param('id') notificationId: string,
    @UserContext() user: AuthPayload
  ) {
    return this.notificationCommandService.deleteNotification(notificationId, user);
  }

  @Post('test')
  @ApiOperation({ summary: 'Create test notification (development only)' })
  @ApiResponse({ status: 201, description: 'Test notification created' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Test Notification' },
        message: { type: 'string', example: 'This is a test notification' }
      }
    }
  })
  async createTestNotification(
    @UserContext() user: AuthPayload,
    @Body() body: { title?: string; message?: string }
  ) {
    const notification = await this.notificationCommandService.createNotification({
      title: body.title || 'Test Notification',
      message: body.message || 'This is a test notification from the API',
      userId: user.id,
      metadata: { isTest: true }
    });
    
    return notification;
  }
}
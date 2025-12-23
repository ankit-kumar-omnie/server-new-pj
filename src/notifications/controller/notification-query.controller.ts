import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationQueryService } from '../service/notification-query.service';
import { AuthGuard } from '../../user/guards/auth.guard';
import { UserContext } from '../../user/decorators/user-auth-details.decorator';
import type { AuthPayload } from '../../user/utils/auth.payload';

@ApiTags('Notifications-Queries')
@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationQueryController {
  constructor(
    private readonly notificationQueryService: NotificationQueryService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @UserContext() user: AuthPayload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly: boolean = false
  ) {
    return this.notificationQueryService.findByUserId(
      user,
      page,
      limit,
      unreadOnly
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@UserContext() user: AuthPayload) {
    const count = await this.notificationQueryService.getUnreadCount(user);
    return { unreadCount: count };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  async getNotificationStats(@UserContext() user: AuthPayload) {
    return this.notificationQueryService.getNotificationStats(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  async getNotificationById(
    @Param('id') notificationId: string,
    @UserContext() user: AuthPayload
  ) {
    return this.notificationQueryService.findById(notificationId, user);
  }
}
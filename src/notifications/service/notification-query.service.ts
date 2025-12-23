import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { AuthPayload } from 'src/user/utils/auth.payload';
import { Roles } from 'src/user/utils/roles.enum';

@Injectable()
export class NotificationQueryService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async findByUserId(
    user: AuthPayload,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const userId = user?.id;
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Role-based access control
    if (![Roles.SUPERADMIN, Roles.ADMIN]?.includes(user?.role)) {
      filter.userId = userId;
    }

    if (unreadOnly) {
      filter.read = false;
    }

    // Create unread count filter with same role-based logic
    const unreadFilter: any = { read: false };
    if (![Roles.SUPERADMIN, Roles.ADMIN]?.includes(user?.role)) {
      unreadFilter.userId = userId;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationRepository.findNotifications(filter, {
        sort: { createdAt: -1 },
        skip,
        limit,
      }),
      this.notificationRepository.countNotifications(filter),
      this.notificationRepository.countNotifications(unreadFilter),
    ]);

    return { notifications, total, unreadCount };
  }

  async getUnreadCount(user: AuthPayload): Promise<number> {
    const filter: any = { read: false };
    
    // Role-based access control
    if (![Roles.SUPERADMIN, Roles.ADMIN]?.includes(user?.role)) {
      filter.userId = user.id;
    }
    
    return this.notificationRepository.countNotifications(filter);
  }

  async findById(notificationId: string, user: AuthPayload) {
    const filter: any = { id: notificationId };
    
    // Role-based access control
    if (![Roles.SUPERADMIN, Roles.ADMIN]?.includes(user?.role)) {
      filter.userId = user.id;
    }
    
    return this.notificationRepository.findNotification(filter);
  }

  async getNotificationStats(user: AuthPayload) {
    const matchFilter: any = {};
    
    // Role-based access control
    if (![Roles.SUPERADMIN, Roles.ADMIN]?.includes(user?.role)) {
      matchFilter.userId = user.id;
    }

    // First check if there are any notifications
    const totalCount = await this.notificationRepository.countNotifications(matchFilter);
    
    if (totalCount === 0) {
      return { total: 0, unread: 0, read: 0, typeBreakdown: {} };
    }

    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              priority: '$priority',
              read: '$read',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          unread: 1,
          read: { $subtract: ['$total', '$unread'] },
          typeBreakdown: {
            $reduce: {
              input: '$byType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [
                        {
                          k: '$$this.type',
                          v: {
                            $add: [
                              {
                                $ifNull: [
                                  {
                                    $getField: {
                                      field: '$$this.type',
                                      input: '$$value',
                                    },
                                  },
                                  0,
                                ],
                              },
                              1,
                            ],
                          },
                        },
                      ],
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ];

    const result = await this.notificationRepository.aggregateNotifications(pipeline);
    return result[0] || { total: 0, unread: 0, read: 0, typeBreakdown: {} };
  }
}
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async findNotification(filter: any): Promise<Notification | null> {
    return this.notificationModel.findOne(filter).exec();
  }

  async findNotifications(filter: any, options?: any): Promise<Notification[]> {
    let query = this.notificationModel.find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.skip) {
      query = query.skip(options.skip);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query.exec();
  }

  async countNotifications(filter: any): Promise<number> {
    return this.notificationModel.countDocuments(filter);
  }

  async createNotification(data: any): Promise<Notification> {
    const notification = new this.notificationModel(data);
    const saved = await notification.save();
    // Return the document with both _id and id fields
    return saved;
  }

  async updateNotification(
    filter: any,
    update: any,
  ): Promise<Notification | null> {
    return this.notificationModel
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async updateManyNotifications(
    filter: any,
    update: any,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(filter, update);
    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(filter: any): Promise<boolean> {
    const result = await this.notificationModel.deleteOne(filter);
    return result.deletedCount > 0;
  }

  async aggregateNotifications(pipeline: any[]): Promise<any[]> {
    return this.notificationModel.aggregate(pipeline);
  }
}

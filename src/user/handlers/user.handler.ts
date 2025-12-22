import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/eventbase/event-names';
import type { UserCreatedPayload } from '../events/user-created.event';
import type { UserUpdatedPayload } from '../events/user-updated.event';

@Injectable()
export class UserHandler {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @OnEvent(EventName.UserCreated)
  async handleCreateUser(payload: UserCreatedPayload) {
    await this.userModel.create(payload);
  }

  @OnEvent(EventName.UserUpdated)
  async handleUpdateUser(payload: UserUpdatedPayload) {
    await this.userModel.updateOne(
      { id: payload?.id },
      { $set: { ...payload } },
    );
  }
}

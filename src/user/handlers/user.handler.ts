import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import { UpdateUserPayload } from '../dto/update-user.dto';
import { UserRepository } from '../repository/user.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from 'src/eventbase/event-names';
import type { UserCreatedPayload } from '../events/user-created.event';

@Injectable()
export class UserHandler {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @OnEvent(EventName.UserCreated)
  async handleCreateUser(payload: UserCreatedPayload) {
    await this.userModel.create(payload);
  }

  @OnEvent(EventName.UserUpdated)
  async handleUpdateUser(payload: UpdateUserPayload) {
    await this.userModel.updateOne(
      { id: payload?.id },
      { $set: { ...payload } },
    );
  }
}

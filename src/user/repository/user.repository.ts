import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findUser(filter: any): Promise<User | null> {
    return await this.userModel.findOne<User>(filter);
  }

  async get(filter?: any): Promise<User[] | null> {
    return await this.userModel.find<User>(filter, { _id: 0, password: 0 });
  }
}

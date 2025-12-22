import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { v4 } from 'uuid';
import { UserRepository } from '../repository/user.repository';
import { EventEmitterService } from 'src/eventbase/event-emitter.service';
import { EventName } from 'src/eventbase/event-names';
import { UserCreatedPayload } from '../events/user-created.event';
import * as bcrypt from 'bcrypt';
import { AuthDto } from '../dto/auth-user.dto';
import { AuthPayload } from '../utils/auth.payload';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserUpdatedPayload } from '../events/user-updated.event';

@Injectable()
export class UserCommandService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitterService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findUser({
      email: dto.email,
    });

    if (existingUser) {
      throw new BadRequestException(
        `User already exists with email: ${dto.email}`,
      );
    }

    const id = v4();
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const payload: UserCreatedPayload = {
      id,
      ...dto,
      password: hashedPassword,
    };

    this.eventEmitter.append(EventName.UserCreated, payload);

    const { password, ...userResponse } = payload;
    return userResponse;
  }

  async signIn(dto: AuthDto) {
    const user = await this.userRepository.findUser({
      email: dto.email,
    });

    if (!user) {
      throw new NotFoundException(`Invalid email or password`);
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new NotFoundException(`Invalid email or password`);
    }

    const authPayload: AuthPayload = {
      role: user.role,
      id: user.id,
    };

    const accessToken = this.jwtService.sign(authPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findUser({ id });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findUser({
        email: dto.email,
      });
      if (existingUser) {
        throw new BadRequestException(
          `Email ${dto.email} is already taken by another user`,
        );
      }
    }

    let payload: UserUpdatedPayload = {
      id,
      ...dto,
    };

    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      payload = { ...payload, password: hashedPassword };
    }

    this.eventEmitter.append(EventName.UserUpdated, payload);
    return { message: 'User updated successfully' };
  }
}

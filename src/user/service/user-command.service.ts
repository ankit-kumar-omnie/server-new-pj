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
    try {
      const user = await this.userRepository.findUser({
        email: dto?.email,
      });

      if (user) {
        throw new BadRequestException(
          `User is already created with this email ${dto?.email}`,
        );
      }

      const id = v4();
      const hashedpassword = await bcrypt.hash(dto.password, 10);
      const payload: UserCreatedPayload = {
        id,
        ...dto,
        password: hashedpassword,
      };

      this.eventEmitter.append(EventName.UserCreated, payload);
      return payload;
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  async signIn(dto: AuthDto) {
    const userDetails = await this.userRepository.findUser({
      email: dto?.email,
    });

    if (!userDetails) {
      throw new NotFoundException(
        `User not found with this email ${dto?.email}`,
      );
    }

    const isValidPassword = await bcrypt.compare(
      dto.password,
      userDetails.password,
    );

    if (!isValidPassword) {
      throw new NotFoundException(
        `You have entered wrong password with email ${dto.email}`,
      );
    }

    const authPayload: AuthPayload = {
      role: userDetails.role,
      id: userDetails.id,
    };

    const accessToken = this.jwtService.sign(authPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async updateUser(id: string, authDto: UpdateUserDto) {
    const user = await this.userRepository.findUser({
      id,
    });

    if (!user) {
      throw new BadRequestException(`User not found with this id ${id}`);
    }

    let payload: UserUpdatedPayload = {
      id,
      ...authDto,
    };

    if (authDto?.password) {
      const hashedpassword = await bcrypt.hash(authDto.password, 10);

      payload = { ...payload, password: hashedpassword };
    }

    this.eventEmitter.append(EventName.UserUpdated, payload);
    return 'User Updated SuccessFully.';
  }
}

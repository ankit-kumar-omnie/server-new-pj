import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserCommandService } from './service/user-command.service';
import { UserHandler } from './handlers/user.handler';
import { UserRepository } from './repository/user.repository';
import { UserCommandController } from './controller/user-command.controller';
import { EventModule } from 'src/eventbase/event.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UserQueryController } from './controller/user-query.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventModule,
    JwtModule,
  ],
  providers: [UserCommandService, UserHandler, UserRepository, AuthGuard],
  controllers: [UserCommandController, UserQueryController],
  exports: [AuthGuard, UserRepository],
})
export class UserModule {}

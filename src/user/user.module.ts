import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserCommandService } from './service/user-command.service';
import { UserHandler } from './handlers/user.handler';
import { UserRepository } from './repository/user.repository';
import { UserCommandController } from './controller/user-command.controller';
import { UserQueryController } from './controller/user-query.controller';
import { EventModule } from 'src/eventbase/event.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EventModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    UserCommandService, 
    UserHandler, 
    UserRepository, 
    AuthGuard,
  ],
  controllers: [
    UserCommandController, 
    UserQueryController,
  ],
  exports: [AuthGuard, UserRepository],
})
export class UserModule {}

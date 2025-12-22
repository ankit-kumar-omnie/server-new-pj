import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { UserCommandService } from '../service/user-command.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { AuthDto } from '../dto/auth-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { UserContext } from '../decorators/user-auth-details.decorator';
import type { AuthPayload } from '../utils/auth.payload';

@ApiTags('Users-Management')
@Controller('user')
export class UserCommandController {
  constructor(private readonly userCommandService: UserCommandService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create User',
    description: 'Creates a new user with name and password',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: CreateUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid request payload',
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  async createUser(@Body() dto: CreateUserDto) {
    return this.userCommandService.createUser(dto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign In User' })
  @ApiBody({ type: AuthDto })
  @ApiCreatedResponse({
    description: 'User signed in successfully',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'jwt-token-string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid data',
  })
  async signIn(@Body() authDto: AuthDto) {
    return this.userCommandService.signIn(authDto);
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user details using JWT authentication',
  })
  @ApiBody({ type: AuthDto })
  @ApiCreatedResponse({
    description: 'User updated successfully',
    type: CreateUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or invalid data',
  })
  async updateUser(@UserContext() user: AuthPayload, @Body() authDto: AuthDto) {
    return this.userCommandService.updateUser(user.id, authDto);
  }
}

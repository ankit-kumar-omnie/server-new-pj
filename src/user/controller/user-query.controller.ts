import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserRepository } from '../repository/user.repository';
import { UserContext } from '../decorators/user-auth-details.decorator';
import type { AuthPayload } from '../utils/auth.payload';
import { Roles } from '../utils/roles.enum';
import { AuthGuard } from '../guards/auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesGuard } from '../guards/roles.guard';
import { UserRoles } from '../decorators/user-role-guard.decorator';
import { EventEmitterService } from 'src/eventbase/event-emitter.service';

@ApiTags('Users-Management')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserQueryController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  @UseGuards(RolesGuard)
  @UserRoles(Roles.SUPERADMIN, Roles.ADMIN)
  @Get('all')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Returns a list of all users',
  })
  @ApiOkResponse({ type: [CreateUserDto], description: 'List of users' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async getAll() {
    return await this.userRepository.get();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the currently authenticated user',
  })
  @ApiOkResponse({ type: CreateUserDto, description: 'Current user details' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async getMe(@UserContext() user: AuthPayload) {
    return await this.userRepository.findUser({ id: user.id });
  }

  @UseGuards(RolesGuard)
  @UserRoles(Roles.SUPERADMIN, Roles.ADMIN)
  @Get(':role')
  @ApiOperation({
    summary: 'Get users by role',
    description: 'Returns a list of users filtered by role',
  })
  @ApiParam({
    name: 'role',
    enum: Roles,
    description: 'Role to filter users by',
  })
  @ApiOkResponse({
    type: [CreateUserDto],
    description: 'List of users filtered by role',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  async getByRole(@Param('role') role: Roles) {
    return await this.userRepository.get({ role });
  }

  @Get(':id/aggregate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user aggregate (event-sourced)',
    description:
      'Returns the reconstructed user state by replaying all events for the given user aggregate ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User aggregate ID (UUID)',
    example: '1efd8b03-8248-4cd1-85f2-c968b984f9f0',
  })
  @ApiOkResponse({
    description: 'User aggregate reconstructed from events',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '1efd8b03-8248-4cd1-85f2-c968b984f9f0' },
        name: { type: 'string', example: 'Ankit' },
        email: { type: 'string', example: 'ankit1@omniesolutions.com' },
        role: { type: 'string', example: 'client' },
        dob: { type: 'string', example: '2001-09-22' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiNotFoundResponse({
    description: 'No events found for the given aggregate ID',
  })
  async getAggregate(@Param('id') id: string) {
    return await this.eventEmitter.readStreams(id);
  }
}

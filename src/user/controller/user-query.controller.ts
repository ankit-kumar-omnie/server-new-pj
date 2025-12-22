import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UserRepository } from '../repository/user.repository';
import { UserContext } from '../decorators/user-auth-details.decorator';
import type { AuthPayload } from '../utils/auth.payload';
import { Roles } from '../utils/roles.enum';
import { AuthGuard } from '../guards/auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { RolesGuard } from '../guards/roles.guard';
import { UserRoles } from '../decorators/user-role-guard.decorator';

@ApiTags('Users-Management')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserQueryController {
  constructor(private readonly userRepository: UserRepository) {}

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
}

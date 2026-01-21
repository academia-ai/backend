import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserDecorator } from 'src/utils/common/decorators';
import type { AuthUser } from './types/user.type';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/utils/common/guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  userProfile(
    @UserDecorator()
    user: AuthUser,
  ) {
    return this.usersService.getProfile(user);
  }
}

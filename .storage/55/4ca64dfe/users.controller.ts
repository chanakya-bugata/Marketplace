import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    const userProfile = await this.usersService.findById(user.id);
    const { passwordHash, ...userWithoutPassword } = userProfile;
    return {
      success: true,
      user: userWithoutPassword,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: { name?: string },
  ) {
    const updatedUser = await this.usersService.update(user.id, updateData);
    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return {
      success: true,
      user: userWithoutPassword,
      message: 'Profile updated successfully',
    };
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto } from '@marketplace/shared';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as a vendor' })
  async register(
    @Body() createVendorDto: CreateVendorDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('User authentication required');
    }

    return this.vendorsService.create(userId, createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  async findAll() {
    return this.vendorsService.findAll();
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor profile' })
  async getProfile(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'VENDOR') {
      throw new UnauthorizedException('Only vendors can access this endpoint');
    }

    return this.vendorsService.findByUserId(userId);
  }

  @Get('pending')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending vendor applications (admin only)' })
  async findPending(
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can access this endpoint');
    }

    return this.vendorsService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  async findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vendor profile' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    const vendor = await this.vendorsService.findOne(id);
    
    if (userRole !== 'ADMIN' && vendor.userId !== userId) {
      throw new UnauthorizedException('You can only update your own vendor profile');
    }

    return this.vendorsService.update(id, updateVendorDto);
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve vendor (admin only)' })
  async approve(
    @Param('id') id: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can approve vendors');
    }

    return this.vendorsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject vendor (admin only)' })
  async reject(
    @Param('id') id: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can reject vendors');
    }

    return this.vendorsService.reject(id);
  }

  @Patch(':id/suspend')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend vendor (admin only)' })
  async suspend(
    @Param('id') id: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can suspend vendors');
    }

    return this.vendorsService.suspend(id);
  }
}
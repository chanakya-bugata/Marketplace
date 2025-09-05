import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from '@marketplace/shared';
import { Vendor, VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.prisma.vendor.create({
      data: {
        userId,
        ...createVendorDto,
      },
    });
  }

  async findAll(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      include: {
        products: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        products: true,
      },
    });
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    
    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    return this.prisma.vendor.update({
      where: { id },
      data: { status },
    });
  }

  async findPending(): Promise<Vendor[]> {
    return this.prisma.vendor.findMany({
      where: { status: VendorStatus.PENDING },
    });
  }

  async approve(id: string): Promise<Vendor> {
    return this.updateStatus(id, VendorStatus.APPROVED);
  }

  async reject(id: string): Promise<Vendor> {
    return this.updateStatus(id, VendorStatus.REJECTED);
  }

  async suspend(id: string): Promise<Vendor> {
    return this.updateStatus(id, VendorStatus.SUSPENDED);
  }
}
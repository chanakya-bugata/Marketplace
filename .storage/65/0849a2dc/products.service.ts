import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from '@marketplace/shared';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(vendorId: string, createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        vendorId,
      },
      include: {
        vendor: true,
        category: true,
        variants: true,
      },
    });
  }

  async findAll(filters: ProductFilterDto) {
    const { page = 1, limit = 20, search, categoryId, minPrice, maxPrice, status, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE'; // Only show active products by default
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          vendor: true,
          category: true,
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        vendor: true,
        category: true,
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByVendor(vendorId: string, filters: ProductFilterDto) {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { vendorId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          variants: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, vendorId: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.vendorId !== vendorId) {
      throw new ForbiddenException('You can only update your own products');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        vendor: true,
        category: true,
        variants: true,
      },
    });
  }

  async remove(id: string, vendorId: string): Promise<void> {
    const product = await this.findOne(id);
    
    if (product.vendorId !== vendorId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { stockQuantity: quantity },
    });
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stockQuantity: product.stockQuantity - quantity },
    });
  }
}
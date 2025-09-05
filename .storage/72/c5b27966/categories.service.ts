import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@marketplace/shared';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = this.generateSlug(createCategoryDto.name);
    
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        products: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    const updateData: any = { ...updateCategoryDto };
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      updateData.slug = this.generateSlug(updateCategoryDto.name);
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    
    // Check if category has children
    if (category.children.length > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new Error('Cannot delete category with products');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        products: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@marketplace/shared';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('root')
  @ApiOperation({ summary: 'Get root categories (no parent)' })
  async findRootCategories() {
    return this.categoriesService.findRootCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin only)' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can create categories');
    }

    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can update categories');
    }

    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (admin only)' })
  async remove(
    @Param('id') id: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can delete categories');
    }

    await this.categoriesService.remove(id);
    return { success: true, message: 'Category deleted successfully' };
  }
}
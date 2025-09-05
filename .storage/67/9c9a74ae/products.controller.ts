import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from '@marketplace/shared';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  async findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (vendor only)' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'VENDOR') {
      throw new UnauthorizedException('Only vendors can create products');
    }

    // Get vendor ID from user ID (this would typically be done via a service call)
    const vendorId = userId; // Simplified for now
    return this.productsService.create(vendorId, createProductDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (vendor only)' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'VENDOR') {
      throw new UnauthorizedException('Only vendors can update products');
    }

    const vendorId = userId;
    return this.productsService.update(id, vendorId, updateProductDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (vendor only)' })
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    if (userRole !== 'VENDOR') {
      throw new UnauthorizedException('Only vendors can delete products');
    }

    const vendorId = userId;
    await this.productsService.remove(id, vendorId);
    return { success: true, message: 'Product deleted successfully' };
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get products by vendor' })
  async findByVendor(
    @Param('vendorId') vendorId: string,
    @Query() filters: ProductFilterDto,
  ) {
    return this.productsService.findByVendor(vendorId, filters);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Req, HttpCode, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseError } from 'src/common/dto/response.dto';
import { ResponseMessage } from '../common/constants/message';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/create-category.dto';
import { AiCategoryDto } from 'src/admins/dto/ai-category.dto';


@ApiBearerAuth()
@ApiTags('Admin Module')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-category')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add category api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateCategoryDto })
  addCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminService.createCategory(createCategoryDto);
  }

  @Post('add-sub-category')
  @HttpCode(200)
  @ApiOperation({ summary: 'Add sub-category api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateCategoryDto })
  addSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.adminService.createSubCategory(createSubCategoryDto);
  }

  @Get('category-listing')
  @HttpCode(200)
  @ApiOperation({ summary: 'Category listing api' })
  @ApiResponse({ status: 201, description: 'Success.', type: CreateCategoryDto })
  categoryListing() {
    return this.adminService.listCategories();
  }

  @Get('ai-category-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Category generated data api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AiCategoryDto })
  categoryData(@Query() aiCategoryDto: AiCategoryDto) {
    return this.adminService.aiCategoryData(aiCategoryDto);
  }

  @Get('ai-generate-image')
  @HttpCode(200)
  @ApiOperation({ summary: 'Category generated data api' })
  @ApiResponse({ status: 201, description: 'Success.', type: AiCategoryDto })
  generateImage(@Query() aiCategoryDto: AiCategoryDto) {
    return this.adminService.aiGenerateImage(aiCategoryDto);
  }


}

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PlantHealthService } from './plant-health.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { AnalysisResultDto } from './dto/analysis-result.dto';

@ApiTags('Plant Health')
@Controller('api/plant-health')
export class PlantHealthController {
  constructor(private readonly plantHealthService: PlantHealthService) {}

  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload plant image for disease detection',
    description:
      'Upload a plant image to analyze for diseases and health issues. Returns an analysis ID for tracking results.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Plant image and metadata',
    type: UploadImageDto,
  })
  @ApiResponse({
    status: 202,
    description: 'Image uploaded successfully, analysis in progress',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or missing required fields',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.plantHealthService.uploadImage(file, {
      plantId: uploadDto.plantId,
      location: uploadDto.location,
      notes: uploadDto.notes,
      timestamp: new Date(),
    });

    return {
      success: true,
      ...result,
    };
  }

  @Get('analysis/:id')
  @ApiOperation({
    summary: 'Get analysis results',
    description: 'Retrieve the results of a plant health analysis by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Analysis ID returned from upload endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'Analysis results retrieved successfully',
    type: AnalysisResultDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Analysis not found',
  })
  async getAnalysis(@Param('id') id: string): Promise<AnalysisResultDto> {
    return this.plantHealthService.getAnalysis(id);
  }

  @Get('plants/:plantId/history')
  @ApiOperation({
    summary: 'Get plant health history',
    description:
      'Retrieve historical health analysis data for a specific plant',
  })
  @ApiParam({
    name: 'plantId',
    description: 'Unique identifier for the plant',
  })
  @ApiResponse({
    status: 200,
    description: 'Plant history retrieved successfully',
  })
  async getPlantHistory(@Param('plantId') plantId: string) {
    return this.plantHealthService.getPlantHistory(plantId);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get plant health dashboard',
    description:
      'Retrieve summary statistics and recent alerts for all plants',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard() {
    return this.plantHealthService.getDashboard();
  }

  @Get('plants/:plantId/growth')
  @ApiOperation({
    summary: 'Get plant growth chart data',
    description:
      'Retrieve growth metrics over time for generating growth charts',
  })
  @ApiParam({
    name: 'plantId',
    description: 'Unique identifier for the plant',
  })
  @ApiResponse({
    status: 200,
    description: 'Growth data retrieved successfully',
  })
  async getGrowthData(@Param('plantId') plantId: string) {
    return this.plantHealthService.getGrowthData(plantId);
  }

  @Post('analysis/:id/simulate-disease')
  @ApiOperation({
    summary: 'Simulate disease detection (for testing)',
    description:
      'Simulate disease detection on an existing analysis to test treatment recommendations. This is a development/testing endpoint.',
  })
  @ApiParam({
    name: 'id',
    description: 'Analysis ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        diseaseName: {
          type: 'string',
          enum: [
            'Early Blight',
            'Late Blight',
            'Powdery Mildew',
            'Septoria Leaf Spot',
            'Nutrient Deficiency',
          ],
          description: 'Name of the disease to simulate',
        },
      },
      required: ['diseaseName'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Disease simulation completed with treatment recommendations',
  })
  async simulateDisease(
    @Param('id') id: string,
    @Body('diseaseName') diseaseName: string,
  ) {
    return this.plantHealthService.simulateDiseaseDetection(id, diseaseName);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly uploadDir = process.env.PLANT_HEALTH_UPLOAD_DIR || './uploads/plant-images';
  private readonly maxFileSize = parseInt(process.env.PLANT_HEALTH_MAX_FILE_SIZE || '10485760', 10); // 10MB

  async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  async saveImage(
    file: Express.Multer.File,
    plantId: string,
    timestamp: Date,
  ): Promise<string> {
    await this.ensureUploadDirectory();

    // Generate safe filename
    const dateStr = timestamp.toISOString().replace(/[:.]/g, '-');
    const filename = `${plantId}-${dateStr}.jpg`;
    const filepath = join(this.uploadDir, filename);

    // Process and save image
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    this.logger.log(`Saved image: ${filename}`);
    return `/uploads/plant-images/${filename}`;
  }

  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Only JPEG and PNG images are allowed',
      };
    }

    return { valid: true };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const filename = imageUrl.split('/').pop();
      if (filename) {
        const filepath = join(this.uploadDir, filename);
        await fs.unlink(filepath);
        this.logger.log(`Deleted image: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
    }
  }
}

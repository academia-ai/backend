import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUD_KEY');
    const apiSecret = this.configService.get<string>('CLOUD_SEC');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration variables are missing');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  private generateFileHash(file: Buffer): string {
    return crypto.createHash('sha256').update(file).digest('hex');
  }

  private async findExistingImage(
    fileHash: string,
  ): Promise<CloudinaryUploadResult | null> {
    try {
      const result: {
        resources: Array<{ public_id: string; secure_url: string }>;
      } = await cloudinary.search
        .expression(`context.file_hash=${fileHash}`)
        .max_results(1)
        .execute();

      if (!result || result.resources.length === 0) {
        return null;
      }

      return {
        public_id: result.resources[0].public_id,
        secure_url: result.resources[0].secure_url,
      };
    } catch {
      return null;
    }
  }

  async uploadImage(
    file: Buffer,
    folder = 'projects',
  ): Promise<CloudinaryUploadResult> {
    const fileHash = this.generateFileHash(file);

    const existingImage = await this.findExistingImage(fileHash);
    if (existingImage) {
      return existingImage;
    }
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            allowed_formats: ['jpg', 'png', 'jpeg'],
            resource_type: 'image',
            context: { file_hash: fileHash },
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Upload failed'));
              return;
            }

            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          },
        )
        .end(file);
    });
  }
}

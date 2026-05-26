import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { R2UploadUrlRequest, R2UploadUrlResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class StorageApi {
  private readonly api = inject(ApiClient);

  createR2UploadUrl(request: R2UploadUrlRequest): Promise<R2UploadUrlResponse> {
    return this.api.post<R2UploadUrlResponse>('/files/r2/upload-url', request);
  }

  async uploadToR2(uploadUrl: string, file: File, contentType?: string | null): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType || file.type || 'application/octet-stream' },
      body: file,
    });
    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
  }
}


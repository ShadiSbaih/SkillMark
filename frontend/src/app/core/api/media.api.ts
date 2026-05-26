import { Injectable, inject } from '@angular/core';
import { ApiClient } from './api-client.service';
import { CloudinarySignatureRequest, CloudinarySignatureResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly api = inject(ApiClient);

  cloudinarySignature(request: CloudinarySignatureRequest): Promise<CloudinarySignatureResponse> {
    return this.api.post<CloudinarySignatureResponse>('/media/cloudinary/signature', request);
  }
}


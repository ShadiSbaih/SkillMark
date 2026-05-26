import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api.model';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  get<T>(path: string, params?: QueryParams): Promise<T> {
    return this.unwrap(this.http.get<ApiResponse<T>>(this.url(path), { params: this.params(params) }));
  }

  page<T>(path: string, params?: QueryParams): Promise<PageResponse<T>> {
    return this.get<PageResponse<T>>(path, params);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.unwrap(this.http.post<ApiResponse<T>>(this.url(path), body ?? {}));
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.unwrap(this.http.put<ApiResponse<T>>(this.url(path), body));
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.unwrap(this.http.patch<ApiResponse<T>>(this.url(path), body));
  }

  delete<T>(path: string): Promise<T> {
    return this.unwrap(this.http.delete<ApiResponse<T>>(this.url(path)));
  }

  private async unwrap<T>(source: ReturnType<HttpClient['get']>): Promise<T> {
    const response = (await firstValueFrom(source)) as ApiResponse<T>;
    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }

  private url(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  private params(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}


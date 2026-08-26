import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ApiErrorResponse,
  ApiResponse,
  PageResponse,
  isApiErrorResponse,
} from './api-response.model';

type QueryParamValue = string | number | boolean | null | undefined;

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(endpoint: string, params?: Record<string, QueryParamValue>): Observable<T> {
    return this.request<T>('GET', endpoint, { params: this.buildParams(params) });
  }

  getPage<T>(endpoint: string, params?: Record<string, QueryParamValue>): Observable<PageResponse<T>> {
    return this.http
      .get<ApiResponse<PageResponse<T>>>(this.buildUrl(endpoint), {
        params: this.buildParams(params),
      })
      .pipe(
        map((response) => this.unwrapResponse(response)),
        catchError((error) => throwError(() => this.normalizeError(error)))
      );
  }

  post<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.request<T>('POST', endpoint, { body });
  }

  put<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.request<T>('PUT', endpoint, { body });
  }

  patch<T>(endpoint: string, body?: unknown): Observable<T> {
    return this.request<T>('PATCH', endpoint, { body });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.request<T>('DELETE', endpoint);
  }

  private request<T>(
    method: string,
    endpoint: string,
    options: { params?: HttpParams; body?: unknown } = {}
  ): Observable<T> {
    const url = this.buildUrl(endpoint);
    const request$ =
      method === 'GET'
        ? this.http.get<ApiResponse<T>>(url, { params: options.params })
        : method === 'POST'
          ? this.http.post<ApiResponse<T>>(url, options.body ?? null)
          : method === 'PUT'
            ? this.http.put<ApiResponse<T>>(url, options.body ?? null)
            : method === 'PATCH'
              ? this.http.patch<ApiResponse<T>>(url, options.body ?? null)
              : this.http.delete<ApiResponse<T>>(url);

    return request$.pipe(
      map((response) => this.unwrapResponse(response)),
      catchError((error) => throwError(() => this.normalizeError(error)))
    );
  }

  private buildParams(params?: Record<string, QueryParamValue>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    }
    return httpParams;
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return cleanEndpoint ? `${this.baseUrl}/${cleanEndpoint}` : this.baseUrl;
  }

  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw this.createApiError(response);
    }
    return response.data;
  }

  private createApiError<T>(response: ApiResponse<T>): ApiErrorResponse {
    return {
      success: false,
      message: response.message,
      code: (response as { code?: string }).code,
      timestamp: response.timestamp,
    };
  }

  private normalizeError(error: unknown): ApiErrorResponse {
    if (isApiErrorResponse(error)) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | undefined;
      if (apiError && isApiErrorResponse(apiError)) {
        return apiError;
      }
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  }
}

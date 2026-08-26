import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiClientService } from './api-client.service';
import { environment } from '../../../environments/environment';
import { ApiErrorResponse, ApiResponse } from './api-response.model';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiClientService],
    });
    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('unwraps data from a successful response', () => {
      const response: ApiResponse<string> = {
        success: true,
        message: 'OK',
        data: 'hello',
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.get<string>('test').subscribe((data) => {
        expect(data).toBe('hello');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('builds query params from non-null values', () => {
      const response: ApiResponse<string> = {
        success: true,
        message: 'OK',
        data: 'hello',
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.get<string>('test', { page: 1, active: true, ignored: null }).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/test?page=1&active=true`
      );
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });
  });

  describe('post', () => {
    it('unwraps data from a successful response', () => {
      const response: ApiResponse<{ id: number }> = {
        success: true,
        message: 'Created',
        data: { id: 1 },
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.post<{ id: number }>('test', { name: 'foo' }).subscribe((data) => {
        expect(data.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });
  });

  describe('put', () => {
    it('unwraps data from a successful response', () => {
      const response: ApiResponse<string> = {
        success: true,
        message: 'Updated',
        data: 'updated',
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.put<string>('test', { name: 'foo' }).subscribe((data) => {
        expect(data).toBe('updated');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      expect(req.request.method).toBe('PUT');
      req.flush(response);
    });
  });

  describe('patch', () => {
    it('unwraps data from a successful response', () => {
      const response: ApiResponse<string> = {
        success: true,
        message: 'Patched',
        data: 'patched',
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.patch<string>('test', { name: 'foo' }).subscribe((data) => {
        expect(data).toBe('patched');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      expect(req.request.method).toBe('PATCH');
      req.flush(response);
    });
  });

  describe('delete', () => {
    it('unwraps data from a successful response', () => {
      const response: ApiResponse<boolean> = {
        success: true,
        message: 'Deleted',
        data: true,
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.delete<boolean>('test').subscribe((data) => {
        expect(data).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });
  });

  describe('error handling', () => {
    it('emits an ApiErrorResponse on HTTP error', () => {
      const errorResponse: ApiErrorResponse = {
        success: false,
        message: 'Bad request',
        errors: [{ field: 'name', message: 'Name is required' }],
        path: '/api/v1/test',
        timestamp: '2026-07-02T00:00:00Z',
      };

      service.get<string>('test').subscribe({
        next: () => expect(true).toBe(false),
        error: (err: ApiErrorResponse) => {
          expect(err.success).toBe(false);
          expect(err.message).toBe('Bad request');
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/test`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });
});

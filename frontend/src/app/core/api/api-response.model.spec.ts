import { describe, expect, it } from 'vitest';
import {
  ApiErrorResponse,
  ApiResponse,
  isApiErrorResponse,
} from './api-response.model';

describe('ApiResponse types', () => {
  it('accepts a successful response', () => {
    const response: ApiResponse<string> = {
      success: true,
      message: 'OK',
      data: 'hello',
      timestamp: '2026-07-02T00:00:00Z',
    };

    expect(response.success).toBe(true);
    expect(response.data).toBe('hello');
  });

  it('accepts an error response with validation errors', () => {
    const response: ApiErrorResponse = {
      success: false,
      message: 'Bad request',
      errors: [{ field: 'name', message: 'Name is required' }],
      path: '/api/v1/test',
      timestamp: '2026-07-02T00:00:00Z',
    };

    expect(response.success).toBe(false);
    expect(response.errors?.[0].field).toBe('name');
  });

});

describe('isApiErrorResponse', () => {
  it('returns true when success is false', () => {
    const response: ApiErrorResponse = {
      success: false,
      message: 'Bad request',
      errors: [{ message: 'field is required' }],
      path: '/api/v1/test',
      timestamp: '2026-07-02T00:00:00Z',
    };

    expect(isApiErrorResponse(response)).toBe(true);
  });

  it('returns false when success is true', () => {
    const response: ApiResponse<string> = {
      success: true,
      message: 'OK',
      data: 'hello',
      timestamp: '2026-07-02T00:00:00Z',
    };

    expect(isApiErrorResponse(response)).toBe(false);
  });

  it('returns false for non-object values', () => {
    expect(isApiErrorResponse(null)).toBe(false);
    expect(isApiErrorResponse(undefined)).toBe(false);
    expect(isApiErrorResponse('error')).toBe(false);
    expect(isApiErrorResponse(500)).toBe(false);
  });

  it('returns false when success property is missing', () => {
    expect(isApiErrorResponse({ message: 'error' })).toBe(false);
  });
});

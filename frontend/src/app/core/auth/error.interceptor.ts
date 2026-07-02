import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';
import { isApiErrorResponse } from '../api/api-response.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          void router.navigate(['/sign-in']);
        }

        const message = isApiErrorResponse(error.error)
          ? error.error.message
          : error.message;

        toast.error(message || 'An unexpected error occurred');
      } else {
        toast.error('An unexpected error occurred');
      }

      return throwError(() => error);
    })
  );
};

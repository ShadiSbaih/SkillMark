import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = getMessage(error);
      if (error.status === 401 && !req.url.includes('/public/')) {
        void router.navigate(['/sign-in']);
      } else if (error.status === 403) {
        toast.error(message || 'You do not have access to this action');
      } else if (error.status >= 500) {
        toast.error(message || 'Something went wrong. Please try again.');
      } else if (error.status !== 404) {
        toast.error(message || 'Request failed');
      }
      return throwError(() => error);
    }),
  );
};

function getMessage(error: HttpErrorResponse): string {
  if (typeof error.error?.message === 'string') {
    const details = Array.isArray(error.error.errors) && error.error.errors.length
      ? ` ${error.error.errors.join(' ')}`
      : '';
    return `${error.error.message}${details}`;
  }
  return error.message;
}


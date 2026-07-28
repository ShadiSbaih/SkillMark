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
        const isMeEndpointNotFound = error.status === 404 && req.url.endsWith('/me');
        if (error.status === 401 || isMeEndpointNotFound) {
          const currentUrl = router.url;
          void router.navigate(['/sign-in'], {
            queryParams: currentUrl && currentUrl !== '/sign-in' ? { redirect: currentUrl } : null,
          });
        } else if (error.status === 403) {
          toast.error('Forbidden: you do not have permission to access this resource');
        }

        const message = isApiErrorResponse(error.error)
          ? error.error.message
          : error.message;

        if (error.status !== 401 && !isMeEndpointNotFound) {
          toast.error(message || 'An unexpected error occurred');
        }
      } else {
        toast.error('An unexpected error occurred');
      }

      return throwError(() => error);
    })
  );
};

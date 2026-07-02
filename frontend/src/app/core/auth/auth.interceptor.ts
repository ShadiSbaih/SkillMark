import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ClerkService } from 'ngx-clerk';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const clerk = inject(ClerkService);
  const session = clerk.session();

  if (!session) {
    return next(req);
  }

  return from(session.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const authenticatedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(authenticatedReq);
    })
  );
};

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authenticatedReq = req.clone({
    withCredentials: true,
  });

  return next(authenticatedReq);
};

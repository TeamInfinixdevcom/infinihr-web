// src/app/core/auth.interceptor.ts  (versión FUNCIONAL)
import { HttpInterceptorFn } from '@angular/common/http';

    export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = btoa('admin:admin'); // TODO: reemplazar por login real
    const cloned = req.clone({ setHeaders: { Authorization: `Basic ${auth}` } });
    return next(cloned);
    };

import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('🚨 Error global capturado:', error);
    
    // Evitar que errores de promises no manejadas rompan la aplicación
    if (error?.rejection || error?.promise) {
      console.warn('⚠️ Promise rechazada capturada por error handler global');
      return;
    }
    
    // Para otros errores, mantener el comportamiento por defecto pero sin lanzar
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
  }
}
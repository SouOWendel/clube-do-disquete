import { InjectionToken } from '@angular/core';

/** Endereco base da API Django (backend/config/urls.py). */
export const API_URL = new InjectionToken<string>('API_URL', {
  factory: () => 'http://localhost:8000/api',
});

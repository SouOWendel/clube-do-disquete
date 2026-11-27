import { InjectionToken } from '@angular/core';

/** Endereco base da API Django (backend/config/urls.py). */
export const API_URL = new InjectionToken<string>('API_URL', {
  factory: () => 'http://localhost:8000/api',
});

/** Endereco do servidor Socket.IO, servido pelo mesmo Django (backend/config/asgi.py). */
export const TEMPO_REAL_URL = new InjectionToken<string>('TEMPO_REAL_URL', {
  factory: () => 'http://localhost:8000',
});

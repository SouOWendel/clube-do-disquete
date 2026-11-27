import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/sessao/token.interceptor';
import { TempoReal } from './core/tempo-real/tempo-real';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    // abre a conexao Socket.IO ao iniciar o app, se ja houver sessao salva
    provideAppInitializer(() => {
      inject(TempoReal);
    }),
  ],
};

import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthApi } from './features/auth/data-access/auth.api';
import { BarraDeTarefas } from './layout/barra-de-tarefas/barra-de-tarefas';
import { PainelDeNotificacoes } from './layout/notificacoes/painel-de-notificacoes';

/** Area de trabalho: fundo em degrade, telas das features, barra de tarefas e avisos. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BarraDeTarefas, PainelDeNotificacoes],
  templateUrl: './app.html',
})
export class App {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

  protected sair(): void {
    this.auth.sair().subscribe({
      complete: () => this.router.navigateByUrl('/entrar'),
      error: () => this.router.navigateByUrl('/entrar'),
    });
  }
}

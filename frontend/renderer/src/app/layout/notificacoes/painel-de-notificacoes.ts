import { Component, inject } from '@angular/core';
import { Notificacoes } from '../../core/notificacoes/notificacoes';
import { Aviso } from '../../shared/ui/aviso/aviso';

/** Mostra as notificacoes empilhadas acima da barra de tarefas, a direita. */
@Component({
  selector: 'app-painel-de-notificacoes',
  imports: [Aviso],
  template: `
    @for (notificacao of notificacoes.lista(); track notificacao.id) {
      <app-aviso
        class="pointer-events-auto sombra-botao"
        [tipo]="notificacao.tipo"
        (click)="notificacoes.dispensar(notificacao.id)"
      >
        {{ notificacao.mensagem }}
      </app-aviso>
    }
  `,
  host: {
    'aria-live': 'polite',
    class:
      'pointer-events-none fixed right-e6 bottom-[82px] z-40 flex w-[440px] max-w-[calc(100vw-48px)] flex-col gap-e2',
  },
})
export class PainelDeNotificacoes {
  protected readonly notificacoes = inject(Notificacoes);
}

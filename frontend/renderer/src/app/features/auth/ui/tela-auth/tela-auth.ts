import { Component } from '@angular/core';
import { Logo } from '../../../../shared/ui/logo/logo';

/** Moldura das telas de autenticacao: placa do logo e a janela centralizadas. */
@Component({
  selector: 'app-tela-auth',
  imports: [Logo],
  template: `
    <div
      class="border-2 border-solid border-borda-padrao bg-fundo-superficie px-e4 py-e2 sombra-botao"
    >
      <app-logo [largura]="264" />
    </div>
    <ng-content />
  `,
  host: {
    class:
      'flex w-full flex-1 flex-col items-center justify-center gap-e6 px-e8 py-e6',
  },
})
export class TelaAuth {}

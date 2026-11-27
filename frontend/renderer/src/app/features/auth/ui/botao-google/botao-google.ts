import { Component, signal } from '@angular/core';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';

/**
 * Botao "Continuar com Google" (Figma > Botao secundario com Icone/google).
 * O backend ja aceita o id_token em /api/auth/google/, mas o fluxo do Google
 * dentro do Electron ainda nao foi ligado; por enquanto so avisa.
 */
@Component({
  selector: 'app-botao-google',
  imports: [Aviso, Botao],
  template: `
    <button appBotao estilo="secundario" type="button" class="w-full" (click)="avisar.set(true)">
      <img src="assets/icones/google.png" alt="" width="16" height="16" class="size-4 object-contain" />
      Continuar com Google
    </button>
    @if (avisar()) {
      <app-aviso tipo="info">O acesso com Google ainda não está disponível no app.</app-aviso>
    }
  `,
  host: { class: 'flex w-full flex-col gap-e4' },
})
export class BotaoGoogle {
  protected readonly avisar = signal(false);
}

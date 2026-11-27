import { Component, computed, input } from '@angular/core';
import { Icone } from '../icone/icone';

export type TipoAviso = 'info' | 'erro' | 'sucesso';

const VARIANTES: Record<
  TipoAviso,
  { caixa: string; icone: string; texto: string }
> = {
  info: {
    caixa: 'border-borda-padrao bg-fundo-destaque',
    icone: 'text-texto-padrao',
    texto: 'text-texto-padrao',
  },
  erro: {
    caixa: 'border-borda-erro bg-fundo-superficie',
    icone: 'text-texto-erro',
    texto: 'text-texto-erro',
  },
  sucesso: {
    caixa: 'border-borda-destaque bg-fundo-superficie',
    icone: 'text-texto-destaque',
    texto: 'text-texto-padrao',
  },
};

/** Mensagem de sistema (Figma > Aviso: Info, Erro, Sucesso). */
@Component({
  selector: 'app-aviso',
  imports: [Icone],
  template: `
    <app-icone
      [nome]="tipo() === 'sucesso' ? 'check' : 'alerta'"
      [class]="variante().icone"
    />
    <p class="m-0 min-w-0 flex-1 texto-corpo-pequeno" [class]="variante().texto">
      <ng-content />
    </p>
  `,
  host: {
    '[attr.role]': "tipo() === 'erro' ? 'alert' : 'status'",
    '[class]':
      "'flex w-full items-center gap-e3 border-2 border-solid px-e4 py-e3 ' + variante().caixa",
  },
})
export class Aviso {
  readonly tipo = input<TipoAviso>('info');

  protected readonly variante = computed(() => VARIANTES[this.tipo()]);
}

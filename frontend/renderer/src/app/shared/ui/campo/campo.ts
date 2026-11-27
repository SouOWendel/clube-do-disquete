import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControleDeFormulario } from '../formulario/controle-de-formulario';
import { MensagemDeAjuda } from '../formulario/mensagem-de-ajuda';
import { Icone, NomeIcone } from '../icone/icone';

/**
 * Campo de texto com rotulo, icone e mensagem de ajuda/erro
 * (Figma > Campo: Padrao, Foco, Erro, Desabilitado). Funciona com
 * `formControlName`/`formControl`. Quando ha erro, a mensagem sempre aparece.
 */
@Component({
  selector: 'app-campo',
  imports: [Icone, MensagemDeAjuda],
  templateUrl: './campo.html',
  host: { class: 'flex w-full flex-col items-start gap-e2' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Campo),
      multi: true,
    },
  ],
})
export class Campo extends ControleDeFormulario<string> {
  readonly icone = input<NomeIcone>();
  readonly tipo = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('off');
  readonly maxlength = input<number>();

  protected readonly valor = signal('');

  protected valorVazio(): string {
    return '';
  }
}

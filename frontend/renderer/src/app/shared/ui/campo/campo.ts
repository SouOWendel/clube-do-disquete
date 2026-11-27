import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icone, NomeIcone } from '../icone/icone';

let proximoId = 0;

/**
 * Campo de formulario com rotulo, icone e mensagem de ajuda/erro
 * (Figma > Campo: Padrao, Foco, Erro, Desabilitado). Funciona com
 * `formControlName`/`ngModel`. Quando ha erro, a mensagem sempre aparece.
 */
@Component({
  selector: 'app-campo',
  imports: [Icone],
  templateUrl: './campo.html',
  host: { class: 'flex w-full flex-col items-start gap-e2' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Campo), multi: true },
  ],
})
export class Campo implements ControlValueAccessor {
  readonly rotulo = input.required<string>();
  readonly icone = input<NomeIcone>();
  readonly tipo = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input('off');
  /** Texto de ajuda exibido abaixo do campo quando nao ha erro. */
  readonly ajuda = input<string>();
  /** Mensagem de erro; quando preenchida o campo entra no estado Erro. */
  readonly erro = input<string | null>(null);

  protected readonly id = `campo-${proximoId++}`;
  protected readonly valor = signal('');
  protected readonly focado = signal(false);
  protected readonly desabilitado = signal(false);

  protected readonly classesCaixa = computed(() => {
    const base = 'flex w-full items-center gap-e3 border-solid';
    if (this.desabilitado()) {
      return `${base} border p-e3 border-borda-sutil bg-fundo-sutil text-texto-desabilitado`;
    }
    if (this.erro()) {
      return `${base} border-2 p-[11px] border-borda-erro bg-fundo-superficie text-texto-secundario`;
    }
    if (this.focado()) {
      return `${base} border-2 p-[11px] border-borda-destaque bg-fundo-superficie text-texto-destaque`;
    }
    return `${base} border p-e3 border-borda-padrao bg-fundo-superficie text-texto-secundario`;
  });

  private aoMudar: (valor: string) => void = () => {};
  private aoTocar: () => void = () => {};

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected digitar(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.valor.set(valor);
    this.aoMudar(valor);
  }

  protected sair(): void {
    this.focado.set(false);
    this.aoTocar();
  }
}

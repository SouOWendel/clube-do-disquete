import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icone } from '../icone/icone';

/** Checkbox retro (Figma > Checkbox: Desmarcado, Marcado, Erro). */
@Component({
  selector: 'app-checkbox',
  imports: [Icone],
  template: `
    <label class="inline-flex cursor-pointer items-center gap-e2">
      <input
        type="checkbox"
        class="peer sr-only"
        [checked]="marcado()"
        [disabled]="desabilitado()"
        [attr.aria-invalid]="erro() ? true : null"
        (change)="alternar($event)"
        (blur)="aoTocar()"
      />
      <span [class]="classesCaixa()">
        @if (marcado()) {
          <app-icone nome="check" [tamanho]="14" class="text-texto-inverso" />
        }
      </span>
      <span
        class="texto-corpo-pequeno"
        [class]="erro() ? 'text-texto-erro' : 'text-texto-padrao'"
      >
        <ng-content />
      </span>
    </label>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true },
  ],
})
export class Checkbox implements ControlValueAccessor {
  readonly erro = input(false);

  protected readonly marcado = signal(false);
  protected readonly desabilitado = signal(false);

  protected readonly classesCaixa = computed(
    () =>
      'flex size-5 shrink-0 items-center justify-center border-2 border-solid ' +
      'peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-dashed ' +
      (this.marcado()
        ? 'border-borda-padrao bg-acao-primaria'
        : this.erro()
          ? 'border-borda-erro bg-fundo-superficie'
          : 'border-borda-padrao bg-fundo-superficie'),
  );

  private aoMudar: (valor: boolean) => void = () => {};
  protected aoTocar: () => void = () => {};

  writeValue(valor: boolean | null): void {
    this.marcado.set(!!valor);
  }

  registerOnChange(fn: (valor: boolean) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected alternar(evento: Event): void {
    const marcado = (evento.target as HTMLInputElement).checked;
    this.marcado.set(marcado);
    this.aoMudar(marcado);
  }
}

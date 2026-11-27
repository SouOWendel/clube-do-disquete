import { Component, computed, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControleDeFormulario } from '../formulario/controle-de-formulario';
import { Icone } from '../icone/icone';

/** Checkbox retro (Figma > Checkbox: Desmarcado, Marcado, Erro). O texto vem no conteudo. */
@Component({
  selector: 'app-checkbox',
  imports: [Icone],
  template: `
    <label class="inline-flex cursor-pointer items-center gap-e2">
      <input
        type="checkbox"
        class="peer sr-only"
        [checked]="valor()"
        [disabled]="desabilitado()"
        [attr.aria-invalid]="erro() ? true : null"
        [attr.aria-describedby]="erro() ? idAjuda : null"
        (change)="alterar($any($event.target).checked)"
        (blur)="sair()"
      />
      <span [class]="classesQuadrado()">
        @if (valor()) {
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
    @if (erro(); as mensagem) {
      <span [id]="idAjuda" class="texto-corpo-pequeno text-texto-erro">{{
        mensagem
      }}</span>
    }
  `,
  host: { class: 'flex flex-col gap-e1' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
})
export class Checkbox extends ControleDeFormulario<boolean> {
  protected readonly valor = signal(false);

  protected readonly classesQuadrado = computed(
    () =>
      'flex size-5 shrink-0 items-center justify-center border-2 border-solid ' +
      'peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-dashed ' +
      (this.valor()
        ? 'border-borda-padrao bg-acao-primaria'
        : this.erro()
          ? 'border-borda-erro bg-fundo-superficie'
          : 'border-borda-padrao bg-fundo-superficie'),
  );

  protected valorVazio(): boolean {
    return false;
  }
}

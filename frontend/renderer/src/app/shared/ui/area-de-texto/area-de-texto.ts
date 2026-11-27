import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControleDeFormulario } from '../formulario/controle-de-formulario';
import { MensagemDeAjuda } from '../formulario/mensagem-de-ajuda';

const numero = new Intl.NumberFormat('pt-BR');

/**
 * Area de texto com placeholder de orientacao, ajuda e contador de caracteres
 * (Figma > Area de texto: Padrao, Foco, Erro). Com `limite`, o contador mostra
 * "N / limite"; sem ele, "N caracteres".
 */
@Component({
  selector: 'app-area-de-texto',
  imports: [MensagemDeAjuda],
  template: `
    @if (rotulo(); as texto) {
      <label [class]="classesRotulo()" [for]="id">{{ texto }}</label>
    }
    <div class="h-40" [class]="classesCaixa()">
      <textarea
        class="size-full resize-none border-0 bg-transparent p-0 texto-corpo text-texto-padrao outline-none placeholder:text-texto-secundario"
        [id]="id"
        [placeholder]="placeholder()"
        [attr.maxlength]="limite() ?? null"
        [value]="valor()"
        [disabled]="desabilitado()"
        [attr.aria-label]="rotulo() ? null : placeholder()"
        [attr.aria-invalid]="erro() ? true : null"
        [attr.aria-describedby]="idAjuda"
        (input)="alterar($any($event.target).value)"
        (focus)="focado.set(true)"
        (blur)="sair()"
      ></textarea>
    </div>
    <app-mensagem-de-ajuda [id]="idAjuda" [erro]="erro()" [ajuda]="ajuda()" [contador]="contador()" />
  `,
  host: { class: 'flex w-full flex-col items-start gap-e2' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AreaDeTexto), multi: true },
  ],
})
export class AreaDeTexto extends ControleDeFormulario<string> {
  readonly placeholder = input('');
  readonly limite = input<number>();

  protected readonly valor = signal('');

  protected readonly contador = computed(() => {
    const total = numero.format(this.valor().length);
    const limite = this.limite();
    return limite ? `${total} / ${numero.format(limite)}` : `${total} caracteres`;
  });

  protected valorVazio(): string {
    return '';
  }
}

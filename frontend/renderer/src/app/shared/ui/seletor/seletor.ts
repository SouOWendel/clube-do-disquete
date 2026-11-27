import { Component, ElementRef, computed, forwardRef, inject, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControleDeFormulario } from '../formulario/controle-de-formulario';
import { MensagemDeAjuda } from '../formulario/mensagem-de-ajuda';
import { Icone } from '../icone/icone';

export interface OpcaoSeletor {
  valor: string;
  rotulo: string;
}

/**
 * Lista suspensa retro (Figma > Seletor: Fechado, Foco, Aberto).
 * Navegavel por teclado: setas, Enter/Espaco para escolher e Esc para fechar.
 */
@Component({
  selector: 'app-seletor',
  imports: [Icone, MensagemDeAjuda],
  templateUrl: './seletor.html',
  host: {
    class: 'flex w-full flex-col items-start gap-e2',
    '(document:click)': 'cliqueFora($event)',
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Seletor), multi: true }],
})
export class Seletor extends ControleDeFormulario<string> {
  readonly opcoes = input.required<readonly OpcaoSeletor[]>();
  readonly placeholder = input('Selecione');

  private readonly elemento = inject(ElementRef<HTMLElement>);

  protected readonly valor = signal('');
  protected readonly aberto = signal(false);
  /** Opcao destacada durante a navegacao por teclado. */
  protected readonly ativa = signal(-1);

  protected readonly selecionada = computed(() =>
    this.opcoes().find((opcao) => opcao.valor === this.valor()),
  );

  protected alternar(): void {
    if (this.desabilitado()) return;
    this.aberto() ? this.fechar() : this.abrir();
  }

  protected escolher(opcao: OpcaoSeletor): void {
    this.alterar(opcao.valor);
    this.fechar();
  }

  protected teclar(evento: KeyboardEvent): void {
    const total = this.opcoes().length;
    switch (evento.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        evento.preventDefault();
        if (!this.aberto()) return this.abrir();
        const passo = evento.key === 'ArrowDown' ? 1 : -1;
        this.ativa.update((i) => (i + passo + total) % total);
        break;
      }
      case 'Enter':
      case ' ':
        evento.preventDefault();
        if (this.aberto() && this.ativa() >= 0) this.escolher(this.opcoes()[this.ativa()]);
        else this.abrir();
        break;
      case 'Escape':
        this.fechar();
        break;
    }
  }

  protected cliqueFora(evento: Event): void {
    if (this.aberto() && !this.elemento.nativeElement.contains(evento.target as Node)) {
      this.fechar();
    }
  }

  protected sairDoBotao(): void {
    if (!this.aberto()) this.sair();
  }

  private abrir(): void {
    this.aberto.set(true);
    this.focado.set(true);
    this.ativa.set(Math.max(0, this.opcoes().findIndex((o) => o.valor === this.valor())));
  }

  private fechar(): void {
    this.aberto.set(false);
    this.sair();
  }

  protected valorVazio(): string {
    return '';
  }
}

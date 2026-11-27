import { Directive, WritableSignal, computed, input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

let proximoId = 0;

/**
 * Base dos controles de formulario do design system (Campo, Area de texto,
 * Seletor). Implementa o ControlValueAccessor e calcula o visual da "Caixa"
 * conforme os estados do Figma: Padrao, Foco, Erro e Desabilitado.
 */
@Directive()
export abstract class ControleDeFormulario<T> implements ControlValueAccessor {
  readonly rotulo = input<string>();
  /** Texto de ajuda exibido abaixo do controle quando nao ha erro. */
  readonly ajuda = input<string>();
  /** Mensagem de erro; quando preenchida o controle entra no estado Erro. */
  readonly erro = input<string | null>(null);

  protected readonly id = `controle-${proximoId++}`;
  protected readonly idAjuda = `${this.id}-ajuda`;
  protected abstract readonly valor: WritableSignal<T>;
  protected readonly focado = signal(false);
  protected readonly desabilitado = signal(false);

  /** Borda e cor da caixa. A borda grossa compensa 1px no padding para o layout nao pular. */
  protected readonly classesCaixa = computed(() => {
    const base = 'flex w-full border-solid';
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

  protected readonly classesRotulo = computed(
    () => 'texto-rotulo ' + (this.desabilitado() ? 'text-texto-desabilitado' : 'text-texto-padrao'),
  );

  protected aoMudar: (valor: T) => void = () => {};
  protected aoTocar: () => void = () => {};

  writeValue(valor: T | null): void {
    this.valor.set(valor ?? this.valorVazio());
  }

  registerOnChange(fn: (valor: T) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected alterar(valor: T): void {
    this.valor.set(valor);
    this.aoMudar(valor);
  }

  protected sair(): void {
    this.focado.set(false);
    this.aoTocar();
  }

  protected abstract valorVazio(): T;
}

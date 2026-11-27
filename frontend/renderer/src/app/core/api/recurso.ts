import { Resource } from '@angular/core';
import { mensagemGeral } from './mensagem-de-erro';

/**
 * Valor de um resource sem quebrar a tela: no Angular, ler `.value()` de um
 * resource em estado de erro lanca excecao.
 */
export function valorDe<T>(recurso: Resource<T>): T | undefined {
  return recurso.hasValue() ? recurso.value() : undefined;
}

/** Causa HTTP original do erro de um resource (o Angular embrulha o erro). */
export function causaDoErro(recurso: Resource<unknown>): unknown {
  const erro = recurso.error();
  return erro ? ((erro as { cause?: unknown }).cause ?? erro) : null;
}

/** Mensagem amigavel do erro de um resource, ou `null` se nao houver erro. */
export function mensagemDoErro(recurso: Resource<unknown>): string | null {
  const causa = causaDoErro(recurso);
  return causa ? mensagemGeral(causa) : null;
}

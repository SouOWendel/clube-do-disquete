import { HttpErrorResponse } from '@angular/common/http';

/** Erros de validacao do DRF: `{ campo: ['mensagem'] }` ou `{ detail: '...' }`. */
export type ErrosDeCampo = Record<string, string>;

/**
 * Extrai a mensagem geral (`detail` / `non_field_errors`) de uma resposta de erro da API.
 * Retorna `null` quando o erro e so de campos, que ja aparecem em cada campo.
 */
export function mensagemGeral(erro: unknown): string | null {
  const generica = 'Algo deu errado. Tente novamente.';
  if (!(erro instanceof HttpErrorResponse)) return generica;
  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
  }
  const corpo = typeof erro.error === 'object' ? (erro.error as Record<string, unknown> | null) : null;
  const detalhe = primeiraMensagem(corpo?.['detail'] ?? corpo?.['non_field_errors']);
  if (detalhe) return detalhe;
  return Object.keys(errosDeCampo(erro)).length > 0 ? null : generica;
}

/** Mapeia os erros por campo do DRF para `{ campo: 'primeira mensagem' }`. */
export function errosDeCampo(erro: unknown): ErrosDeCampo {
  if (!(erro instanceof HttpErrorResponse) || typeof erro.error !== 'object' || !erro.error) {
    return {};
  }
  const resultado: ErrosDeCampo = {};
  for (const [campo, valor] of Object.entries(erro.error as Record<string, unknown>)) {
    if (campo === 'detail' || campo === 'non_field_errors') continue;
    const mensagem = primeiraMensagem(valor);
    if (mensagem) resultado[campo] = mensagem;
  }
  return resultado;
}

function primeiraMensagem(valor: unknown): string | null {
  if (typeof valor === 'string') return valor;
  if (Array.isArray(valor) && typeof valor[0] === 'string') return valor[0];
  return null;
}

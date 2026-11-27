import { AbstractControl } from '@angular/forms';

/**
 * Traduz o primeiro erro de um controle para a mensagem do mapa.
 * So mostra depois que o usuario tocou no campo ou tentou enviar.
 */
export function mensagemDeValidacao(
  controle: AbstractControl,
  mensagens: Record<string, string>,
  tentouEnviar: boolean,
): string | null {
  if (!(controle.touched || tentouEnviar) || !controle.errors) return null;
  const chave = Object.keys(controle.errors)[0];
  return mensagens[chave] ?? mensagens['required'] ?? 'Valor inválido.';
}

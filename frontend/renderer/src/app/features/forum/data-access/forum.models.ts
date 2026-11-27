/** Modelos de /api/categorias, /api/topicos e /api/topicos/:id/respostas. */

export interface Categoria {
  id_categoria: number;
  codigo: string;
  nome: string;
}

export interface AutorResumo {
  id_usuario: number;
  nome_usuario: string;
}

export interface TopicoResumo {
  id_topico: number;
  titulo: string;
  categoria: Categoria;
  autor: AutorResumo;
  total_respostas: number;
  criado_em: string;
  atualizado_em: string;
  /** `true` quando o usuario logado e o autor. */
  autoria: boolean;
}

export interface Topico extends TopicoResumo {
  corpo: string;
}

export interface Resposta {
  id_resposta: number;
  id_topico: number;
  corpo: string;
  autor: AutorResumo;
  criado_em: string;
  autoria: boolean;
}

export type Ordenacao = 'recentes' | 'em-alta';

/** Dados de criacao/edicao. `categoria` e o codigo (ex.: `placas-de-video`). */
export interface DadosTopico {
  categoria: string;
  titulo: string;
  corpo: string;
}

/** Regras de negocio do backend (TopicoEscritaSerializer / RespostaEscritaSerializer). */
export const LIMITES = {
  tituloMin: 8,
  tituloMax: 140,
  corpoMin: 20,
  respostaMax: 10_000,
} as const;

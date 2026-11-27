import { Resposta, Topico, TopicoResumo } from './forum.models';

/**
 * Eventos Socket.IO do forum (backend/core/tempo_real.py). O campo `autoria`
 * chega sempre `false`, porque o servidor envia o mesmo dado para todos;
 * quem recebe compara `autor.id_usuario` com o proprio usuario.
 */
export interface TopicoCriado {
  topico: TopicoResumo;
}

export interface TopicoAtualizado {
  topico: Topico;
}

export interface TopicoExcluido {
  id_topico: number;
}

export interface RespostaCriada {
  resposta: Resposta;
  total_respostas: number;
}

export interface RespostaExcluida {
  id_topico: number;
  id_resposta: number;
  total_respostas: number;
}

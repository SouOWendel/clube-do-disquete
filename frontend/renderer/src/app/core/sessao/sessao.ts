import { Injectable, computed, signal } from '@angular/core';

/** Perfil publico retornado por /api/auth/login, /cadastro e /me. */
export interface Usuario {
  id_usuario: number;
  email: string;
  nome_usuario: string;
  termos_aceitos: boolean;
  possui_senha: boolean;
  google_vinculado: boolean;
  criado_em: string;
}

interface SessaoSalva {
  token: string;
  usuario: Usuario;
}

const CHAVE = 'clube-do-disquete:sessao';

/** Guarda o token JWT e o usuario logado, persistidos no localStorage. */
@Injectable({ providedIn: 'root' })
export class Sessao {
  private readonly estado = signal<SessaoSalva | null>(this.ler());

  readonly token = computed(() => this.estado()?.token ?? null);
  readonly usuario = computed(() => this.estado()?.usuario ?? null);
  readonly logado = computed(() => this.estado() !== null);

  iniciar(token: string, usuario: Usuario): void {
    this.estado.set({ token, usuario });
    localStorage.setItem(CHAVE, JSON.stringify({ token, usuario }));
  }

  encerrar(): void {
    this.estado.set(null);
    localStorage.removeItem(CHAVE);
  }

  private ler(): SessaoSalva | null {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? (JSON.parse(bruto) as SessaoSalva) : null;
    } catch {
      return null;
    }
  }
}

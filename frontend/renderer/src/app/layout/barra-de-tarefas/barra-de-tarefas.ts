import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { abaDaRotaAtual } from '../../core/navegacao/aba-da-rota';
import { Sessao } from '../../core/sessao/sessao';
import { Botao } from '../../shared/ui/botao/botao';
import { Icone } from '../../shared/ui/icone/icone';
import { GerenciadorDeJanelas } from '../../shared/ui/janela/gerenciador-de-janelas';
import { Logo } from '../../shared/ui/logo/logo';
import { Aba } from './aba';

/**
 * Barra inferior estilo Windows 95 (Figma > Barra de tarefas: Deslogado/Logado).
 * Logo (Iniciar), abas internas, janelas minimizadas, busca e sessao
 * (ENTRAR ou usuario + SAIR).
 */
@Component({
  selector: 'app-barra-de-tarefas',
  imports: [RouterLink, Aba, Botao, Icone, Logo],
  templateUrl: './barra-de-tarefas.html',
  host: {
    class:
      'flex w-full shrink-0 items-center gap-e2 border-t-2 border-solid border-borda-padrao ' +
      'bg-linear-to-b from-(--cor-barra-topo) to-(--cor-barra-base) px-e3 py-e2',
  },
})
export class BarraDeTarefas {
  protected readonly sessao = inject(Sessao);
  private readonly router = inject(Router);
  protected readonly janelas = inject(GerenciadorDeJanelas);

  /** Aba aberta pela tela atual (Topico, Novo topico, Editar topico...). */
  protected readonly abaAtual = abaDaRotaAtual();

  readonly sair = output<void>();

  protected buscar(termo: string): void {
    const busca = termo.trim() || null;
    this.router.navigate(['/'], { queryParams: { busca } });
  }

  protected fecharAba(): void {
    this.router.navigateByUrl('/');
  }
}

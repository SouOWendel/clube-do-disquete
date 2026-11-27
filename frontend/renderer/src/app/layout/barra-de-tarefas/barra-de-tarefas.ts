import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sessao } from '../../core/sessao/sessao';
import { Botao } from '../../shared/ui/botao/botao';
import { Icone } from '../../shared/ui/icone/icone';
import { Logo } from '../../shared/ui/logo/logo';

/**
 * Barra inferior estilo Windows 95 (Figma > Barra de tarefas: Deslogado/Logado).
 * Logo (Iniciar), abas internas, busca e sessao (ENTRAR ou usuario + SAIR).
 */
@Component({
  selector: 'app-barra-de-tarefas',
  imports: [RouterLink, Botao, Icone, Logo],
  templateUrl: './barra-de-tarefas.html',
  host: {
    class:
      'flex w-full shrink-0 items-center gap-e2 border-t-2 border-solid border-borda-padrao ' +
      'bg-linear-to-b from-(--cor-barra-topo) to-(--cor-barra-base) px-e3 py-e2',
  },
})
export class BarraDeTarefas {
  protected readonly sessao = inject(Sessao);

  readonly sair = output<void>();
}

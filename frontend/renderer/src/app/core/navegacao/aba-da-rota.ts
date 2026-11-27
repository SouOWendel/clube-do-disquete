import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { NomeIcone } from '../../shared/ui/icone/icone';

/** Aba interna que uma rota abre na barra de tarefas (RF08). Vai em `data.aba`. */
export interface AbaDaRota {
  nome: string;
  icone: NomeIcone;
}

/** Aba aberta agora, com o endereco da tela que a abriu. */
export interface AbaAberta extends AbaDaRota {
  url: string;
}

/**
 * Le `data.aba` da rota ativa mais profunda. Retorna `null` nas telas que
 * nao abrem aba propria (como o feed).
 */
export function abaDaRotaAtual() {
  const router = inject(Router);
  return toSignal(
    router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => lerAba(router)),
    ),
    { initialValue: lerAba(router) },
  );
}

function lerAba(router: Router): AbaAberta | null {
  let atual: ActivatedRouteSnapshot = router.routerState.snapshot.root;
  while (atual.firstChild) atual = atual.firstChild;
  const aba = atual.data['aba'] as AbaDaRota | undefined;
  return aba ? { ...aba, url: router.url } : null;
}

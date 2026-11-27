import { Routes } from '@angular/router';
import { AbaDaRota } from '../../core/navegacao/aba-da-rota';

const aba = (nome: string, icone: AbaDaRota['icone']): { aba: AbaDaRota } => ({
  aba: { nome, icone },
});

const feed = () => import('./pages/feed/feed').then((m) => m.Feed);
const formulario = () =>
  import('./pages/formulario-topico/formulario-topico').then((m) => m.FormularioTopico);

export const FORUM_ROUTES: Routes = [
  { path: '', title: 'Clube do Disquete', loadComponent: feed },
  { path: 'categoria/:codigo', title: 'Clube do Disquete', loadComponent: feed },
  {
    path: 'topicos/novo',
    title: 'Novo tópico · Clube do Disquete',
    data: aba('Novo tópico', 'mais'),
    loadComponent: formulario,
  },
  {
    path: 'topicos/:id',
    title: 'Tópico · Clube do Disquete',
    data: aba('Tópico', 'mensagem'),
    loadComponent: () => import('./pages/topico/topico').then((m) => m.PaginaTopico),
  },
  {
    path: 'topicos/:id/editar',
    title: 'Editar tópico · Clube do Disquete',
    data: aba('Editar tópico', 'editar'),
    loadComponent: formulario,
  },
];

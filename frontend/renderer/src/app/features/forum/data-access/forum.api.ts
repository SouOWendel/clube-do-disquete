import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { API_URL } from '../../../core/api/api-url';
import {
  Categoria,
  DadosTopico,
  Ordenacao,
  Resposta,
  Topico,
  TopicoResumo,
} from './forum.models';

/** Chamadas do forum na API Django (backend/topicos e backend/respostas). */
@Injectable({ providedIn: 'root' })
export class ForumApi {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_URL);

  /** As 6 categorias sao fixas, entao a lista e buscada uma vez e reaproveitada. */
  private readonly categorias$ = this.http
    .get<Categoria[]>(`${this.url}/categorias/`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  categorias(): Observable<Categoria[]> {
    return this.categorias$;
  }

  topicos(categoria: string | null, ordenar: Ordenacao): Observable<TopicoResumo[]> {
    const params = new HttpParams({ fromObject: { categoria: categoria ?? 'todas', ordenar } });
    return this.http.get<TopicoResumo[]>(`${this.url}/topicos/`, { params });
  }

  topico(id: number): Observable<Topico> {
    return this.http.get<Topico>(`${this.url}/topicos/${id}/`);
  }

  criarTopico(dados: DadosTopico): Observable<Topico> {
    return this.http.post<Topico>(`${this.url}/topicos/`, dados);
  }

  editarTopico(id: number, dados: DadosTopico): Observable<Topico> {
    return this.http.put<Topico>(`${this.url}/topicos/${id}/`, dados);
  }

  excluirTopico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/topicos/${id}/`);
  }

  respostas(idTopico: number): Observable<Resposta[]> {
    return this.http.get<Resposta[]>(`${this.url}/topicos/${idTopico}/respostas/`);
  }

  responder(idTopico: number, corpo: string): Observable<Resposta> {
    return this.http.post<Resposta>(`${this.url}/topicos/${idTopico}/respostas/`, { corpo });
  }
}

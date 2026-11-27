import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errosDeCampo, mensagemGeral } from '../../../../core/api/mensagem-de-erro';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Campo } from '../../../../shared/ui/campo/campo';
import { Janela } from '../../../../shared/ui/janela/janela';
import { Link } from '../../../../shared/ui/link/link';
import { AuthApi } from '../../data-access/auth.api';
import { TelaAuth } from '../../ui/tela-auth/tela-auth';

/** Tela "RECUPERAR A SENHA" (Figma > Home — revisao > Esqueci a senha). */
@Component({
  selector: 'app-esqueci-senha',
  imports: [ReactiveFormsModule, RouterLink, Aviso, Botao, Campo, Janela, Link, TelaAuth],
  templateUrl: './esqueci-senha.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class EsqueciSenha {
  private readonly auth = inject(AuthApi);
  protected readonly router = inject(Router);

  protected readonly email = inject(NonNullableFormBuilder).control('', [
    Validators.required,
    Validators.email,
  ]);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly sucesso = signal<string | null>(null);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly erroServidor = signal<string | null>(null);

  protected erro(): string | null {
    if (this.erroServidor()) return this.erroServidor();
    if (!(this.email.touched || this.enviado()) || this.email.valid) return null;
    return this.email.hasError('required') ? 'Informe seu e-mail.' : 'Informe um e-mail válido.';
  }

  protected enviarLink(): void {
    this.enviado.set(true);
    this.sucesso.set(null);
    this.erroGeral.set(null);
    this.erroServidor.set(null);
    if (this.email.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.auth.recuperarSenha(this.email.value).subscribe({
      next: ({ detail }) => {
        this.enviando.set(false);
        this.sucesso.set(detail);
      },
      error: (erro: unknown) => {
        this.enviando.set(false);
        this.erroServidor.set(errosDeCampo(erro)['email'] ?? null);
        this.erroGeral.set(mensagemGeral(erro));
      },
    });
  }
}

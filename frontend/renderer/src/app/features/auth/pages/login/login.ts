import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  errosDeCampo,
  ErrosDeCampo,
  mensagemGeral,
} from '../../../../core/api/mensagem-de-erro';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Campo } from '../../../../shared/ui/campo/campo';
import { DivisorOu } from '../../../../shared/ui/divisor-ou/divisor-ou';
import { Janela } from '../../../../shared/ui/janela/janela';
import { Link } from '../../../../shared/ui/link/link';
import { AuthApi } from '../../data-access/auth.api';
import { BotaoGoogle } from '../../ui/botao-google/botao-google';
import { TelaAuth } from '../../ui/tela-auth/tela-auth';

/** Tela "ENTRAR NO FORUM" (Figma > Home — revisao > Login). */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Aviso,
    Botao,
    BotaoGoogle,
    Campo,
    DivisorOu,
    Janela,
    Link,
    TelaAuth,
  ],
  templateUrl: './login.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class Login {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly errosServidor = signal<ErrosDeCampo>({});

  protected erro(campo: 'email' | 'senha'): string | null {
    const controle = this.form.controls[campo];
    if (this.errosServidor()[campo]) return this.errosServidor()[campo];
    if (!(controle.touched || this.enviado()) || controle.valid) return null;
    if (controle.hasError('required')) {
      return campo === 'email' ? 'Informe seu e-mail.' : 'Informe sua senha.';
    }
    return 'Informe um e-mail válido.';
  }

  protected entrar(): void {
    this.enviado.set(true);
    this.erroGeral.set(null);
    this.errosServidor.set({});
    if (this.form.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.auth.entrar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (erro: unknown) => {
        this.enviando.set(false);
        this.errosServidor.set(errosDeCampo(erro));
        this.erroGeral.set(mensagemGeral(erro));
      },
    });
  }
}

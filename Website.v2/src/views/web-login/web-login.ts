import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { AuthService } from '../../services/auth.service';

import './web-login.scss';

@customElement('web-login')
export default class WebLogin extends PageMixin(LitElement) {
  @query('form')
  form!: HTMLFormElement;

  @query('#email')
  emailInput!: HTMLInputElement;
    
  @query('#password')
  passwordInput!: HTMLInputElement;

  @property({type: Boolean})
  error = false;

  render(): TemplateResult {
    return html`
      <div class="signin-container">
        <form class="form-signin needs-validation">
          <h1 class="h3 mb-3 fw-normal">Bitte logge dich ein</h1>
  
          <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="floatingInput">Email address</label>
          </div>
          <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="floatingPassword">Password</label>
          </div>
          
          <div class="message-box">
            ${ this.error ? html`
            <div  class="text-danger"> 
              Login fehlgeschlagen! Haben Sie Email und Passwort richtig eingegeben? Ist ihr Account bereits aktiviert worden? Wenn nein, kontaktieren Sie einen Admin.
            </div>
            ` : undefined}
          </div>
  
          <button class="w-100 btn btn-lg btn-primary" type="submit" @click=${this.submit}>Login</button>
          
          <div class="form-text">Du hast noch keinen Account? <button type="button" class="btn btn-link" @click=${() => router.navigate('register')}>Registriere dich</button></div>
          <p class="mt-5 mb-3 text-muted">&copy; 2021</p>
        </form>
      </div>
        `
  }

  async submit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    if (this.form.reportValidity()) {
      try {
        await AuthService.login(this.emailInput.value, this.passwordInput.value);
        this.form.reset();
        router.navigate('events');
      } catch (error) {
        console.error(error);
        this.error = true;
        this.requestUpdate();
      }
    }
  }
}
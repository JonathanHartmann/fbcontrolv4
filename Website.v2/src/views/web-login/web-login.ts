import { customElement, html, LitElement, query, TemplateResult } from 'lit-element';
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

  render(): TemplateResult {
    return html`
      <div class="signin-container">
        <form class="form-signin">
          <img class="mb-4" src="https://cdn3.iconfinder.com/data/icons/planning-3/64/date-time-calendar-event-booking-512.png" alt="" width="72" height="57">
          <h1 class="h3 mb-3 fw-normal">Bitte logge dich ein</h1>
  
          <div class="form-floating">
            <input type="email" class="form-control" id="email" placeholder="name@example.com">
            <label for="floatingInput">Email address</label>
          </div>
          <div class="form-floating">
            <input type="password" class="form-control" id="password" placeholder="Password">
            <label for="floatingPassword">Password</label>
          </div>

          <div class="checkbox mb-3">
            <label>
              <input type="checkbox" value="remember-me"> Remember me
            </label>
          </div>
  
          <button class="w-100 btn btn-lg btn-primary" type="button" @click=${this.submit}>Login</button>
          
          <div class="form-text">Du hast noch keinen Account? <button type="button" class="btn btn-link" @click=${() => router.navigate('register')}>Registriere dich</button></div>
          <p class="mt-5 mb-3 text-muted">&copy; 2021</p>
        </form>
      </div>
        `
  }

  async submit(): Promise<void> {
    if (this.form.reportValidity()) {
      const response = await AuthService.login(this.emailInput.value, this.passwordInput.value);
      console.log(response);
      router.navigate('events');
    }
  }
}
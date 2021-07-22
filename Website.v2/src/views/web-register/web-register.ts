import { customElement, html, LitElement, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { AuthService } from '../../services/auth.service';

import './web-register.scss';

@customElement('web-register')
export default class WebRegister extends PageMixin(LitElement) {
  @query('form')
  form!: HTMLFormElement;

  @query('#name')
  nameInput!: HTMLInputElement;

  @query('#email')
  emailInput!: HTMLInputElement;
    
  @query('#password')
  passwordInput!: HTMLInputElement;

  @query('#password2')
  password2Input!: HTMLInputElement;

  render(): TemplateResult {
    return html`
      <div class="signin-container">
        <form class="form-signin">
          <img class="mb-4" src="https://cdn3.iconfinder.com/data/icons/planning-3/64/date-time-calendar-event-booking-512.png" alt="" width="72" height="57">
          <h1 class="h3 mb-3 fw-normal">Bitt registriere dich</h1>
  
          <div class="form-floating">
            <input type="text" required class="form-control" id="name" placeholder="Max Mustermann">
            <label for="floatingInput">Vorname Nachname</label>
          </div>
          <div class="form-floating">
            <input type="email" required class="form-control" id="email" placeholder="name@example.com">
            <label for="floatingInput">Email-Adresse</label>
          </div>
          <div class="form-floating">
            <input type="password" required class="form-control" id="password" placeholder="Password">
            <label for="floatingPassword">Passwort</label>
          </div>
          <div class="form-floating">
            <input type="password" required class="form-control" id="password2" placeholder="Password">
            <label for="floatingPassword">Bestätige dein Passwort</label>
          </div>

          <button class="w-100 btn btn-lg btn-primary" type="button" @click=${this.submit}>Registrieren</button>

          <div class="form-text">Du hast bereits einen Account? <button type="button" class="btn btn-link" @click=${() => router.navigate('login')}>Log dich ein</button></div>
          <p class="mt-5 mb-3 text-muted">&copy; 2021</p>
        </form>
      </div>
        `
  }

  async submit(): Promise<void> {
    const password1 = this.passwordInput.value;
    const password2 = this.password2Input.value;
    if (this.form.reportValidity() && (password1 === password2)) {
      const response = await AuthService.register(this.emailInput.value, this.passwordInput.value, this.nameInput.value);
      console.log(response);
      router.navigate('events');
    }
  }
}
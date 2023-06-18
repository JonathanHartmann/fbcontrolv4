import { Modal } from 'bootstrap';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { AuthService } from '../../services/auth.service';

import './web-register.scss';
const version = process.env.version;
const copy = process.env.copy;
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

  @property({type: Boolean})
  error = false;

  render(): TemplateResult {
    return html`
      <div class="signin-container">
        <form class="form-signin">
          <h1 class="h3 mb-3 fw-normal">Bitte registriere dich</h1>
  
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

          <div class="message-box">
            ${ this.error ? html`
            <div  class="text-danger"> 
              Irgendetwas ist schiefgelaufen. Bitte versuchen sie es später nocheinmal
            </div>
            ` : undefined}
          </div>

          <button class="w-100 btn btn-lg btn-primary" type="submit" @click=${this.submit}>Registrieren</button>

          <div class="form-text">Du hast bereits einen Account? <button type="button" class="btn btn-link" @click=${() => router.navigate('login')}>Log dich ein</button></div>
          <p class="mt-5 mb-3 text-muted">&copy;${copy} Jonathan Hartmann & \nTill Hoffmann v${version}</p>
        </form>
      </div>


      <!-- Modal -->
      <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="registerModalLabel">Account Aktivierung</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Bitte benachrichtigen Sie ihren zuständigen Admin, um ihren Account zu aktivieren.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Ok</button>
            </div>
          </div>
        </div>
      </div>
        `
  }

  async submit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const password1 = this.passwordInput.value;
    const password2 = this.password2Input.value;
    if (this.form.reportValidity() && (password1 === password2)) {
      try {
        await AuthService.register(this.emailInput.value, this.passwordInput.value, this.nameInput.value);
        const element = document.getElementById('registerModal');
        if (element) {
          const registerModal = new Modal(element);
          registerModal.show();
        }
        this.resetForm();
      } catch (error) {
        console.error(error);
        this.error = true;
        this.requestUpdate();
      }
    }
  }

  resetForm(): void {
    this.form.reset();
  }
}
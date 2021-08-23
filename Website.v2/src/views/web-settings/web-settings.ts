import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IRoom } from '../../interfaces/room.interface';
import { IUser } from '../../interfaces/user.interface';
import { store } from '../../redux/store';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

import './web-settings.scss';

@customElement('web-settings')
export default class WebSettings extends PageMixin(LitElement) {

  @property({ attribute: false })
  user: IUser | undefined;

  @property({ attribute: false })
  rooms: IRoom[] = [];

  @query('form')
  form!: HTMLFormElement;

  @query('#passwordOld')
  passwordOldInput!: HTMLInputElement;

  @query('#password1')
  password1Input!: HTMLInputElement;

  @query('#password2')
  password2Input!: HTMLInputElement;

  @property({ attribute: false })
  error = '';

  @property({ attribute: false })
  success = false;

  @property({ attribute: false })
  isLoading = false;

  constructor() {
    super();
    this.user = store.getState().user;
  }

  render(): TemplateResult {
    return html`
    <div class="container">
      <h1>Passwort ändern</h1>
      <form class="w-50">
        <div class="mb-3">
          <label for="passwordOld" class="form-label">Altes Passwort</label>
          <input type="password" class="form-control" id="passwordOld" aria-describedby="password">
        </div>
        <div class="mb-3">
          <label for="password1" class="form-label">Neues Passwort</label>
          <input type="password" class="form-control" id="password1" aria-describedby="newPassword">
        </div>
        <div class="mb-3">
          <label for="password2" class="form-label">Neues Passwort wiederholen</label>
          <input type="password" class="form-control" id="password2">
        </div>

        <div class="message-box">
          ${ this.error.length > 0 ? html`
          <div  class="text-danger"> 
            ${this.error}
          </div>
          ` : undefined}
        </div>

        <div class="message-box">
          ${ this.success ? html`
          <div  class="text-success"> 
            Passwort wurde erfolgreich geändert!
          </div>
          ` : undefined}
        </div>
        
        <div class="message-box">
          ${ this.isLoading ? html`
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          ` : undefined}
        </div>

        <button type="submit" class="btn btn-primary" @click=${this.updatePassword}>Speichern</button>
      </form>
      <hr/>
      <h1>Nutzer Account unwiederruflich löschen</h1>
      <button type="button" class="btn btn-danger" @click=${this.deleteUser}>Account löschen</button>
    </div>
    `
  }

  async updatePassword(event: MouseEvent): Promise<void> {
    event.preventDefault();
    if (this.form.reportValidity() && this.password1Input.value === this.password2Input.value && this.passwordOldInput.value) {
      try {
        this.isLoading = true;
        const success = await AuthService.updatePasswort(this.password1Input.value, this.passwordOldInput.value);
        if (success) {
          this.error = ''
          this.success = true;
          setTimeout(() => this.success = false, 5000);
        } else {
          this.error = 'Fehler beim Passwort ändern. Versuchen Sie es später noch einmal.';
          console.error('Something went wrong by updating the password!');
        }
        this.isLoading = false;
        this.form.reset();
      } catch (error) {
        console.error(error);
        this.error = 'Fehler beim Passwort ändern. Versuchen Sie es später noch einmal.';
      }
    } else {
      this.error = 'Die Passwörter stimmen nicht überein oder das alte Passwort ist falsch!'
    }
  }

  deleteUser(): void {
    const deleteUser = confirm('Soll dieser Account wirklich unwiederruflich gelöscht werden?');
    if (this.user && deleteUser) {
      UserService.deleteUser(this.user.id);
    }
  }
}
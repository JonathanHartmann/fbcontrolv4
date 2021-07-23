import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { IState } from '../../interfaces/state.interface';
import { AuthService } from '../../services/auth.service';


import './navbar.scss';

@customElement('web-navbar')
export default class WebNavbar extends PageMixin(LitElement) {

  @property()
  path = '';
  
  @property({type: Boolean})
  isLogedIn = false;

  constructor() {
    super();
    this.path = router.getPath();
    router.subscribe((path) => this.path = path)
  }

  stateChanged(state: IState): void {
    if(state.user) {
      this.isLogedIn = true;
    } else {
      this.isLogedIn = false;
    }
  }

  render(): TemplateResult {
    return html`
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="/">Raum buchung</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
              ${ this.path === 'login' ? html `
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="/register">Registrieren</a>
                </li>
                ` : undefined }
              ${ this.path === 'register' ? html `
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="/login">Login</a>
                </li>
                ` : undefined }
              ${ this.isLogedIn ? html `
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#" @click=${this.logout}>Logout</a>
                </li>
                <li class="nav_item">
                  <add-event></add-event>
                </li>
                ` : undefined }

            </ul>
          </div>
        </div>
      </nav>
      `
  }

  async logout(): Promise<void> {
    const successful = await AuthService.logout();
    console.log('logout: ', successful);
    if (successful) {
      router.navigate('login');
    } else {
      alert('Es gab einen Fehler beim ausloggen. Probiere es gleich nochmal!');
    }
  }
}
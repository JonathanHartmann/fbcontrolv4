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

  @property({type: Boolean})
  isAdmin = false;

  constructor() {
    super();
    this.path = router.getPath();
    router.subscribe((path) => this.path = path)
  }

  stateChanged(state: IState): void {
    this.isLogedIn = state.loggedIn;
    this.isAdmin = state.user?.role === 'admin';
  }

  render(): TemplateResult {
    return html`
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
        <span class="navbar-brand mb-0 h1">Raum Buchung</span>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
            ${ this.isLogedIn && this.isAdmin ? html `
                <li class="nav-item">
                  <a class="nav-link" href="/admin">Admin</a>
                </li>
                ` : undefined }
              ${ this.path === 'login' ? html `
                <li class="nav-item">
                  <a class="nav-link" href="/register">Registrieren</a>
                </li>
                ` : undefined }
              ${ this.path === 'register' ? html `
                <li class="nav-item">
                  <a class="nav-link" href="/login">Login</a>
                </li>
                ` : undefined }
              ${ this.isLogedIn ? html `
                <li class="nav-item">
                  <a class="nav-link" href="/events">Buchung</a>
                </li>
                <li class="nav-item dropstart">
                  <a class="nav-link nav-icon" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle"></i>
                  </a>

                  <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="/profile">Einstellungen</a></li>
                    <li><a class="dropdown-item" href="#" @click=${this.logout}>Logout</a></li>
                  </ul>
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
    if (successful) {
      router.navigate('login');
    } else {
      alert('Es gab einen Fehler beim ausloggen. Probiere es gleich nochmal!');
    }
  }
}
import { Dropdown } from 'bootstrap';
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
  smallScreen = true;
  
  @property({type: Boolean})
  isLogedIn = false;

  @property({type: Boolean})
  isAdmin = false;

  @property({attribute: false})
  dropdown: Dropdown | undefined = undefined;

  constructor() {
    super();
    this.path = router.getPath();
    router.subscribe((path) => this.path = path)

    this.smallScreen = window.innerWidth < 992;
    window.addEventListener('resize', () => {
      this.smallScreen = window.innerWidth < 992;
    });
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
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse flex-row-reverse" id="navbarSupportedContent">
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

                ${ this.smallScreen? html`
                  <li class="nav-item">
                    <a class="nav-link" href="/settings">Einstellungen</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#" @click=${this.logout}>Logout</a>
                  </li>
                  `: html`
                  <li class="nav-item dropstart dropdown">
                    <a class="nav-link" href="#" @click=${this.logout}>
                      Logout
                    </a>
                  </li>
                  <li class="nav-item dropstart dropdown">
                    <a class="nav-link nav-icon" href="/settings">
                      <i class="bi bi-person-circle"></i>
                    </a>
                  </li>
                  `}
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
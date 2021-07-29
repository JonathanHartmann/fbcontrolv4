import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { IState } from '../../interfaces/state.interface';
import { userLogin } from '../../redux/actions/user.actions';
import { store } from '../../redux/store';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

import './web-root.scss';

@customElement('web-root')
export default class WebRoot extends PageMixin(LitElement) {

  @property({type: Boolean})
  isLogedIn = false;

  @property({type: Boolean})
  isAdmin = false;

  routes = new Map<string, {auth: boolean, admin: boolean, template: TemplateResult}>([
    ['login', {auth: false, admin: false, template: html`<web-login></web-login>`}],
    ['register', {auth: false, admin: false, template: html`<web-register></web-register>`}],
    ['events', {auth: true, admin: false, template: html`<web-events></web-events>`}],
    ['admin', {auth: true, admin: true, template: html`<web-admin></web-admin>`}],
  ]);

  stateChanged(state: IState): void {
    this.isLogedIn = state.loggedIn;
    this.isAdmin = state.user?.role === 'admin';
    if (!this.isLogedIn) {
      AuthService.onUserChange(async (firebaseUser) => {
        if (firebaseUser) {
          const user = await UserService.getUser(firebaseUser.uid);
          if (user) {
            store.dispatch(userLogin({...user, id: firebaseUser.uid}))
          }
        }
      })
    }
  }

  render(): TemplateResult {
    return html`
        <web-navbar></web-navbar>
        <main class="content">
            ${this.renderOutlet()}
        </main>
        `
  }

  firstUpdated(): void {
    router.subscribe(() => {
      this.requestUpdate()
    });
  }

  renderOutlet(): TemplateResult | void {
    const path = router.getPath();

    if ((this.routes.get(path)?.auth || path === '') && !this.isLogedIn) {
      // unauthorized
      router.navigate('login');
      return this.routes.get('login')?.template;

    } else if ((path === 'login' || path === 'register' || path === '') && this.isLogedIn) {
      // authorized but want to login again
      router.navigate('events');
      return this.routes.get('events')?.template;
    } else {
      // default
      if ((this.routes.get(path)?.admin && this.isAdmin) || !this.routes.get(path)?.admin) {
        return this.routes.get(path)?.template;
      }
    }
  }
}
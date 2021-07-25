import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';
import { IState } from '../../interfaces/state.interface';

import './web-root.scss';

@customElement('web-root')
export default class WebRoot extends PageMixin(LitElement) {

  @property({type: Boolean})
  isLogedIn = false;

  routes = new Map<string, {auth: boolean, template: TemplateResult}>([
    ['events', {auth: true, template: html`<web-events></web-events>`}],
    ['login', {auth: false, template: html`<web-login></web-login>`}],
    ['register', {auth: false, template: html`<web-register></web-register>`}]
  ]);

  stateChanged(state: IState): void {
    this.isLogedIn = state.loggedIn;
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
      return this.routes.get(path)?.template;
    }
  }
}
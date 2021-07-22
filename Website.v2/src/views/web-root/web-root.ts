import { customElement, html, LitElement, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';

import './web-root.scss';

@customElement('web-root')
export default class WebRoot extends PageMixin(LitElement) {

  render(): TemplateResult {
    return html`
            <main class="content">
                ${this.renderOutlet()}
            </main>
        `
  }

  firstUpdated(): void {
    router.subscribe(() => this.requestUpdate());
  }

  renderOutlet(): TemplateResult {
    switch(router.getPath()) {
      case 'events':
        return html`<web-events></web-events>`
      case 'login':
        return html`<web-login></web-login>`
      case 'register':
        return html`<web-register></web-register>`
      default:
        return html`<web-register></web-register>`
    }
  }
}
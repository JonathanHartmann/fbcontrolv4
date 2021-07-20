import { customElement, html, LitElement, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { router } from '../../client-packages/router';

import './web-root.scss';

@customElement('web-root')
export default class WebRoot extends PageMixin(LitElement) {

  render(): TemplateResult {
    return html`
            <div class="content">
                ${this.renderOutlet()}
            </div>
        `
  }

  firstUpdated(): void {
    router.subscribe(() => this.requestUpdate());
  }

  renderOutlet(): TemplateResult {
    switch(router.getPath()) {
      case 'test-route':
        return html`` // add here your component
      default:
        return html`` // add here your component
    }
  }
}
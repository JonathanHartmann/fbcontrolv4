import { customElement, html, LitElement, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { EventService } from '../../services/event.service';

import './web-events.scss';

@customElement('web-events')
export default class WebEvents extends PageMixin(LitElement) {

  render(): TemplateResult {
    return html`
            <web-calendar></web-calendar>
        `
  }

  firstUpdated(): void {
    this.loadEvents();
  }
  
  loadEvents(): void {
    EventService.loadEvents();
  }
}
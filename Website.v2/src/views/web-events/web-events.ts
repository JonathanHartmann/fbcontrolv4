import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { EventService } from '../../services/event.service';

import './web-events.scss';

@customElement('web-events')
export default class WebEvents extends PageMixin(LitElement) {

  @property()
  events: IEvent[] = [];

  render(): TemplateResult {
    return html`
      <div class="container">
        <div class="mb-3">
          <h1>Kalendar Übersicht</h1>
          <web-calendar></web-calendar>
        </div>
        <hr class="my-5"/>
        <div class="mb-3 events-list">
          <h1>Alle Buchungen</h1>
          <ol class="list-group list-group-numbered">
          ${ this.events.map(event => { return html`
              <li class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                  <div class="fw-bold">${event.title}</div>
                  Raum: ${event.room} - ${event.start.toDate().getUTCDate()} bis ${event.end.toDate().getUTCDate()}
                </div>
                <button type="button" class="btn btn-danger" @click=${() => this.deleteEvent(event.id)}>löschen</button>
              </li>
            `})}
        </ol>
        </div>
      </div>
        `
  }

  firstUpdated(): void {
    this.loadEvents();
  }

  stateChanged(state: IState): void {
    if (state.events.length > 0) {
      this.events = state.events;
    }
  }
  
  loadEvents(): void {
    EventService.loadEvents();
  }

  deleteEvent(id: string): void {
    EventService.deleteEvent(id);
  }
}
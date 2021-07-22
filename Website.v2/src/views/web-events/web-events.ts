import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { EventService } from '../../services/event.service';

import './web-events.scss';

@customElement('web-events')
export default class WebEvents extends PageMixin(LitElement) {
  @property() events: IEvent[] = []

  render(): TemplateResult {
    return html`
            <add-event></add-event>
            <hr/>
            <button class="btn" @click=${this.getEvents}><i class="bi bi-arrow-clockwise"></i></button>

            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Veranstaltung</th>
                  <th scope="col">Raum</th>
                  <th scope="col">Begin</th>
                  <th scope="col">Ende</th>
                  <th scope="col">Erstellt von</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                ${this.events.map(event => {
    const beginDate = event.begin.toDate().toLocaleDateString()
    const beginTime = event.begin.toDate().toLocaleTimeString()
    const endDate = event.begin.toDate().toLocaleDateString()
    const endTime = event.begin.toDate().toLocaleTimeString()
    return html`
                    <tr>
                      <th scope="row">${event.title}</th>
                      <td>${event.room}</td>
                      <td>${beginDate + ' - ' + beginTime}</td>
                      <td>${endDate + ' - ' + endTime}</td>
                      <td>${event.createdFrom}</td>
                      <td><button class="btn" @click=${() => this.deleteEvent(event.id!)}><i class="bi bi-trash"></i></button></td>
                    </tr>
                    `;
  })
}
              </tbody>
            </table>
        `
  }

  firstUpdated(): void {
    this.getEvents();
  }

  getEvents(): void {
    EventService.getEvents().then((events) => {
      this.events = events as IEvent[];
      this.requestUpdate();
    })
  }

  deleteEvent(id: string) {
    EventService.deleteEvent(id);
    this.getEvents();
  }
}
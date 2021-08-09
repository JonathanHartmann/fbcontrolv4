import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser } from '../../interfaces/user.interface';
import { EventService } from '../../services/event.service';
import { RoomService } from '../../services/room.service';

import './web-events.scss';

@customElement('web-events')
export default class WebEvents extends PageMixin(LitElement) {

  @property({attribute: false})
  events: IEvent[] = [];

  @property({attribute: false})
  user: IUser | undefined = undefined;

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


          <table class="table">
            <thead>
              <tr>
                <th scope="col">Titel</th>
                <th scope="col">Start</th>
                <th scope="col">Ende</th>
                <th scope="col">Raum</th>
                <th scope="col">Erstellt von</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              ${ this.events.map(event => { return html`
              <tr>
                <th scope="row">${event.title}</th>
                <td>${this.formateDate(event.start.toDate())}</td>
                <td>${this.formateDate(event.end.toDate())}</td>
                <td>${event.room}</td>
                <td>${event.createdFrom}</td>
                ${this.user?.role === 'admin' || this.user?.id === event.createdFromId? html`
                <td>
                  <edit-event .event=${event} class="align-self-center me-3"></edit-event>
                  <button type="button" class="btn btn-danger" @click=${() => this.deleteEvent(event.id)}>Löschen</button>
                </td>
                `: undefined}
              </tr>
            </tbody>
            `})}
          </table>
        </div>
      </div>
        `
  }

  firstUpdated(): void {
    this.loadEvents();
    this.loadRooms();
  }

  stateChanged(state: IState): void {
    this.user = state.user;
    if (state.events.length > 0) {
      this.events = state.events;
    }
  }
  
  loadEvents(): void {
    EventService.loadEvents();
  }

  async loadRooms(): Promise<void> {
    await RoomService.loadRooms();
  }

  deleteEvent(id: string): void {
    EventService.deleteEvent(id);
  }

  formateDate(date: Date): string {
    let month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      minutes = date.getMinutes().toString();
    const year = date.getFullYear(),
      hours = date.getHours();

    if (month.length < 2) 
      month = '0' + month;
    if (day.length < 2) 
      day = '0' + day;
    if (minutes.length < 2) 
      minutes = minutes + '0';

    return [day, month, year].join('.') + ' ' + hours + ':' + minutes + ' Uhr';
  }
}
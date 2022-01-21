import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser, ROLE } from '../../interfaces/user.interface';
import { EventService } from '../../services/event.service';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user.service';

import './web-events.scss';

@customElement('web-events')
export default class WebEvents extends PageMixin(LitElement) {

  @property({attribute: false})
  events: IEvent[] = [];

  @property({attribute: false})
  user: IUser | undefined = undefined;

  render(): TemplateResult {
    return html`
      <div class="">
        <web-calendar></web-calendar>
      </div>
        `
  }

  firstUpdated(): void {
    this.loadEvents();
    this.loadRooms();
    if (this.user && this.user.role == ROLE.ADMIN) {
      this.loadUsers();
    }
  }

  stateChanged(state: IState): void {
    this.user = state.user;
    if (state.events.length >= 0) {
      this.events = state.events.sort((a, b) => {
        if (a.start > b.start) {
          return 1;
        } else if (a.start < b.start) {
          return -1;
        } else {
          return 0;
        }
      });
    }
  }
  
  loadEvents(): void {
    EventService.loadEvents();
  }

  async loadRooms(): Promise<void> {
    await RoomService.loadRooms();
  }

  loadUsers(): void {
    UserService.getAllUser()
  }

  deleteEvent(id: string): void {
    const deleteSingle = confirm('Soll diese Buchung wirklich gelöscht werden?');
    if (id) {
      const deleteFuture = confirm('Sollen ebenfalls alle Zukünftigen Buchungen gelöscht werden?');
      if (deleteFuture) {
        EventService.deleteEvent(id, true);
        return;
      }
    }
    if (deleteSingle == true) {
      EventService.deleteEvent(id);
    }
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
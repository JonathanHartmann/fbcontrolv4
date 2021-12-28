import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import * as ICAL from 'ical.js'
import { PageMixin } from '../../client-packages/page.mixin';
import { IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser, ROLE } from '../../interfaces/user.interface';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user.service';

import './web-admin.scss';
import { EventService } from '../../services/event.service';

@customElement('web-admin')
export default class WebAdmin extends PageMixin(LitElement) {

  @property({ attribute: false })
  users: IUser[] = [];

  @property({ attribute: false })
  rooms: IRoom[] = [];

  @property({ attribute: false })
  user: IUser | undefined = undefined;

  @query('#events')
  eventsInput!: HTMLInputElement;

  render(): TemplateResult {
    return html`
    <div class="container">
      <ul class="nav nav-tabs mb-3" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#users" type="button" role="tab" aria-controls="users" aria-selected="true">Nutzer</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="rooms-tab" data-bs-toggle="tab" data-bs-target="#rooms" type="button" role="tab" aria-controls="rooms" aria-selected="false">Räume</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="background-events-tab" data-bs-toggle="tab" data-bs-target="#backgroundEvents" type="button" role="tab" aria-controls="backgroundEvents" aria-selected="false">Ferien</button>
        </li>

      </ul>
      <div class="tab-content" id="myTabContent">

        <!-- Nutzer Tab -->
        <div class="tab-pane fade show active" id="users" role="tabpanel" aria-labelledby="users-tab">
          <ol class="list-group list-group-numbered">
            ${ this.users.map(user => {
    return html`
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="ms-2 me-auto">
                    <div class="fw-bold">${user.name}</div>
                    Email: ${user.email}
                  </div>
                  </div>
                    <select @input="${() => this.changeRole(user.id)}" class="form-control select" id=${'role-' + user.id} ?disabled=${user.id === this.user?.id}>
                      <option value=${ROLE.ACTIVATED} ?selected=${user.role === ROLE.ACTIVATED}>${ROLE.ACTIVATED}</option>
                      <option value=${ROLE.INACTIVE} ?selected=${user.role === ROLE.INACTIVE}>${ROLE.INACTIVE}</option>
                      <option value=${ROLE.ADMIN} ?selected=${user.role === ROLE.ADMIN}>${ROLE.ADMIN}</option>
                    </select>
                </li>
              `;
  })}
          </ol>
        </div>

        <!-- Raeume Tab -->
        <div class="tab-pane fade" id="rooms" role="tabpanel" aria-labelledby="rooms-tab">
          <div class="mb-3">
            <add-room></add-room>
          </div>
          <ol class="list-group list-group-numbered">
            ${ this.rooms.map(room => {
    return html`
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="ms-2 me-auto">
                    <div class="fw-bold">${room.title}</div>
                    Komforttemperatur: ${room.comfortTemp}°C - Absenktemperatur: ${room.emptyTemp}°C - Fritzbox AIN: ${room.fritzId}
                  </div>
                  <edit-room .room=${room}></edit-room>
                  <button type="button" class="btn btn-danger" @click=${() => this.deleteRoom(room.id)}>Löschen</button>
                </li>
              `;
  })}
          </ol>
        </div>

        <!-- Background Events Tab -->
        <div class="tab-pane fade" id="backgroundEvents" role="tabpanel" aria-labelledby="background-events-tab">
          <h1>Ferien hochladen</h1>
          <form>
            <div class="mb-3">
              <label for="events" class="form-label">Lade eine .iCal Datei hoch, welche die Tage enthält, an denen ein Background-Event eingerichtet wird. <br>Serientermine finden dort nicht statt.</label>
              <input class="form-control" type="file" id="events" name="events" accept="ical">
            </div>
            <button type="submit" class="btn btn-primary" @click=${this.upload}>Hochladen</button>
          </form>
        </div>


      </div>
    </div>
        `
  }

  firstUpdated(): void {
    this.loadAllUsers();
    this.loadAllRooms();
  }

  stateChanged(state: IState): void {
    if (state.rooms.length > 0) {
      this.rooms = state.rooms;
    }
    this.user = state.user;
  }

  async upload(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const files = this.eventsInput.files;
    if (files && files.length > 0 && this.user?.role === 'admin') {
      let errorByUpload = false;
      for (let index = 0; index < files.length; index++) {
        const file = files.item(index);
        if (file) {
          const content = await file.text();
          const jcalData = ICAL.parse(content);
          const comp = new ICAL.Component(jcalData);
          const vevents = comp.getAllSubcomponents('vevent');

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vevents.forEach(async (vevent: { jCal: any[] }) => {
            // start of holiday; format: yyyy-mm-dd
            const start: string = vevent.jCal[1][4][3];
            const startDate = new Date(Number(start.slice(0,4)), Number(start.slice(5, 7)) - 1, Number(start.slice(8, 10)));
            // end of holiday; format: yyyy-mm-dd
            const end: string = vevent.jCal[1][5][3];
            const endDate = new Date(Number(end.slice(0,4)), Number(end.slice(5, 7)) - 1, Number(end.slice(8, 10)));
            // name of holiday
            const name: string = vevent.jCal[1][3][3];
            if (this.user) {
              try {
                await EventService.createBackgroundEvent(name, startDate, endDate, this.user);
              } catch(e) {
                console.error('Ein Fehler ist aufgetreten:', e);
                errorByUpload = true;
              }
            }
          });
        }
      }
      if (errorByUpload) {
        alert('Es gab einen Fehler beim hochladen der Ferien. Es kann sein, dass die Ferien unvollständig hochgeladen wurden. Versuche es später noch einmal.');
      } else {
        alert('Ferientermine wurden erfolgreich hochgeladen!');
      }
    }
  }

  async loadAllUsers(): Promise<void> {
    const users = await UserService.getAllUser();
    this.users = users ? users : [];
  }
  
  async loadAllRooms(): Promise<void> {
    await RoomService.loadRooms();
  }

  changeRole(userId: string): void {
    const select = document.getElementById('role-' + userId) as HTMLSelectElement;
    const value = select.options[select.selectedIndex].value;
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      UserService.updateUser({ ...user, role: value as ROLE});
    }
  }

  deleteRoom(roomId: string): void {
    RoomService.deleteRoom(roomId);
  }
}
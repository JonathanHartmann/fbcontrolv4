import { customElement, html, LitElement, property, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser, ROLE } from '../../interfaces/user.interface';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user.service';

import './web-admin.scss';

@customElement('web-admin')
export default class WebAdmin extends PageMixin(LitElement) {

  @property({ attribute: false })
  users: IUser[] = [];

  @property({ attribute: false })
  rooms: IRoom[] = [];

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
                    <select @input="${() => this.changeRole(user.id)}" class="form-control select" id=${'role-' + user.id}>
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
                    Komforttemperatur: ${room.comfortTemp}°C - Absenktemperatur: ${room.emptyTemp}°C - Fritzbox ID: ${room.fritzId}
                  </div>
                  <button type="button" class="btn btn-light">Bearbeiten</button>
                  <button type="button" class="btn btn-danger" @click=${() => this.deleteRoom(room.id)}>Löschen</button>
                </li>
              `;
  })}
          </ol>
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
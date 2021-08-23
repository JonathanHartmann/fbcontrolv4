import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser } from '../../interfaces/user.interface';
import { RoomService } from '../../services/room.service';

import './edit-room.scss';

@customElement('edit-room')
export default class EditRoom extends PageMixin(LitElement) {

  @property({ type: Object })
  room: IRoom | undefined = undefined;

  @property({ attribute: false })
  user: IUser | undefined = undefined;
  
  @property({ attribute: false })
  error: string | undefined = undefined;

  @query('form')
  form!: HTMLFormElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  stateChanged(state: IState): void {
    this.user = state.user;
  }

  render(): TemplateResult {
    if (this.room) {
      return html`
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-light" data-toggle="modal" data-target=${'#editRoom' + this.room.id}>
          Bearbeiten
        </button>


        <div class="modal fade" id=${'editRoom' + this.room.id} tabindex="-1" role="dialog" aria-labelledby=${'editRoomLabel' + this.room.id} aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id=${'editRoomLabel' + this.room.id}>Raum bearbeiten</h5>
                <button type="button" class="close btn" data-dismiss="modal" aria-label="Close" id=${'close' + this.room.id}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body ">
                <form class="form">
                  <div class="mb-3">
                    <label for=${'title' + this.room.id}>Raumname</label>
                    <input required type="text" class="form-control" value=${this.room.title} id=${'title' + this.room.id}>
                  </div>
                  <div class="mb-3">
                    <label for=${'comfortTemp' + this.room.id}>Komforttemperatur</label>
                    <input id=${'comfortTemp' + this.room.id} required class="form-control" type="number" value=${this.room.comfortTemp}> 
                  </div>
                  <div class="mb-3">
                    <label for=${'emptyTemp' + this.room.id}>Absenktemperatur</label>
                    <input id=${'emptyTemp' + this.room.id} required class="form-control" type="number" value=${this.room.emptyTemp}> 
                  </div>
                  <div class="mb-3">
                    <label for=${'fritzId' + this.room.id}>Fritzbox ID</label>
                    <input id=${'fritzId' + this.room.id} required class="form-control" type="text" value=${this.room.fritzId}> 
                  </div>
                  <div class="mb-3">
                    <label for=${'color' + this.room.id}>Farbe im Kalender</label>
                    <input type="color" id=${'color' + this.room.id} name="color" value=${this.room.eventColor}>
                  </div>
                </form>
              </div>
              <div class="message-box mx-3">
              ${ this.error ? html`
              <div  class="text-danger">${this.error}</div>
              ` : undefined}
            </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
                <button type="button" class="btn btn-primary" @click="${this.submit}">Speichern</button>
              </div>
            </div>
          </div>
        </div>
        `
    } else {
      return html``;
    }
  }

  async submit(): Promise<void> {
    if (this.form.reportValidity() && this.room) {
      const titleInput = document.getElementById('title' + this.room.id) as HTMLInputElement;
      const comfortTempInput = document.getElementById('comfortTemp' + this.room.id) as HTMLInputElement;
      const emptyTempInput = document.getElementById('emptyTemp' + this.room.id) as HTMLInputElement;
      const fritzIdInput = document.getElementById('fritzId' + this.room.id) as HTMLInputElement;
      const colorInput = document.getElementById('color' + this.room.id) as HTMLInputElement;

      await RoomService.updateRoom({
        id: this.room.id,
        title: titleInput.value,
        comfortTemp: Number(comfortTempInput.value),
        emptyTemp: Number(emptyTempInput.value),
        fritzId: fritzIdInput.value,
        createdFrom: this.user?.name,
        createdFromId: this.user?.id,
        eventColor: colorInput.value
      } as IRoom);
      document.getElementById('close' + this.room.id)?.click();
    } else {
      this.error = 'Die Eingaben sind nicht korrekt.';
    }
  }
}
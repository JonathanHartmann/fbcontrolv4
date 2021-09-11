import { customElement, html, LitElement, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IRoom } from '../../interfaces/room.interface';
import { store } from '../../redux/store';
import { RoomService } from '../../services/room.service';

import './add-room.scss';

@customElement('add-room')
export default class AddRoom extends PageMixin(LitElement) {
  @query('form')
  form!: HTMLFormElement;

  @query('#title')
  titleInput!: HTMLInputElement;

  @query('#comfortTemp')
  comfortTempInput!: HTMLInputElement;

  @query('#emptyTemp')
  emptyTempInput!: HTMLInputElement;

  @query('#fritzId')
  fritzIdInput!: HTMLInputElement;

  @query('#color')
  colorInput!: HTMLInputElement;

  @query('#tempTime')
  tempTimeInput!: HTMLInputElement;


  render(): TemplateResult {
    return html`
      <!-- Button trigger modal -->
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#createRoomModal">
        Neuen Raum erstellen
      </button>


      <div class="modal fade" id="createRoomModal" tabindex="-1" role="dialog" aria-labelledby="createRoomModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="createRoomModalLabel">Neuen Raum hinzufügen</h5>
              <button type="button" class="close btn" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form class="form">
                <div class="mb-3">
                  <label for="title">Raumname</label>
                  <input required type="text" class="form-control" id="title">
                </div>
                <div class="mb-3">
                  <label for="comfortTemp" class="form-label">Komforttemperatur</label>
                  <input id="comfortTemp" required class="form-control" type="number" value="21">  
                </div>
                <div class="mb-3">
                  <label for="emptyTemp" class="form-label">Absenktemperatur</label>
                  <input id="emptyTemp" required class="form-control" type="number" value="14">  
                </div>
                <div class="mb-3">
                  <label for="tempTime" class="form-label">Aufheiz-Zeitraum (in Minuten)</label>
                  <input id="tempTime" required class="form-control" type="number" value="15">  
                </div>
                <div class="mb-3">
                  <label for="fritzId" class="form-label">Fritzbox ID</label>
                  <input id="fritzId" required class="form-control" type="text">  
                </div>
                <div class="mb-3">
                  <label for="color" class="form-label">Farbe im Kalender</label>
                  <input type="color" id="color" class="form-control form-control-color" name="color" value="">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
              <button type="button" class="btn btn-primary" data-dismiss="modal" @click="${this.submit}">Speichern</button>
            </div>
          </div>
        </div>
      </div>
      `
  }

  async submit(): Promise<void> {
    const user = store.getState().user;
    if (this.form.reportValidity()) {
      await RoomService.createRoom({
        title: this.titleInput.value,
        comfortTemp: Number(this.comfortTempInput.value),
        emptyTemp: Number(this.emptyTempInput.value),
        fritzId: this.fritzIdInput.value,
        createdFrom: user?.name,
        createdFromId: user?.id,
        eventColor: this.colorInput.value,
        tempTime: Number(this.tempTimeInput.value)
      } as Partial<IRoom>);
    }
  }
}
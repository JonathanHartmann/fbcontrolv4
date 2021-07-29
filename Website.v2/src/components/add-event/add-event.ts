import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { EventService } from '../../services/event.service';

import './add-event.scss';

@customElement('add-event')
export default class AddEvent extends PageMixin(LitElement) {

  @property()
  rooms: IRoom[] = [];

  @query('form')
  form!: HTMLFormElement;

  @query('#title')
  titleInput!: HTMLInputElement;

  @query('#room')
  roomInput!: HTMLInputElement;

  @query('#start')
  startInput!: HTMLInputElement;

  @query('#end')
  endInput!: HTMLInputElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  stateChanged(state: IState): void {
    this.rooms = state.rooms;
  }

  render(): TemplateResult {
    return html`
      <!-- Button trigger modal -->
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#createEventModal">
        Neuer Termin
      </button>


      <div class="modal fade" id="createEventModal" tabindex="-1" role="dialog" aria-labelledby="createEventModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="createEventModalLabel">Neuen Termin hinzufügen</h5>
              <button type="button" class="close btn" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form class="form">
                <div class="mb-3">
                  <label for="title">Titel ihrer Veranstaltung</label>
                  <input required type="text" class="form-control" placeholder="Musikunterricht" id="title">
                </div>
                <div class="mb-3">
                  <label for="room">Raum für ihre Veranstaltung</label>
                  <select required class="form-control" id="room">
                    ${this.rooms.map(room => html`<option value=${room.id}>Raum ${room.title}</option>`)}
                  </select>
                </div>
                <div class="mb-3">
                  <label for="start" class="form-label">Start-Zeitpunkt</label>
                  <input id="start" required class="form-control" type="datetime-local">  
                </div>
                <div class="mb-3">
                  <label for="end" class="form-label">End-Zeitpunkt</label>
                  <input id="end" required class="form-control" type="datetime-local">  
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
    if (this.form.reportValidity()) {
      const startDate = new Date(this.startInput.value);
      const endDate = new Date(this.endInput.value);
      await EventService.createEvent({
        title: this.titleInput.value,
        room: this.roomInput.value,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate)
      } as IEvent);
    }
  }
}
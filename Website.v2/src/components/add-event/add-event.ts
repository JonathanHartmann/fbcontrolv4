import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, query } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { EventService } from '../../services/event.service';

import './add-event.scss';

@customElement('add-event')
export default class AddEvent extends PageMixin(LitElement) {
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

  render() {
    return html`
      <!-- Button trigger modal -->
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
        Neuer Termin
      </button>


      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Neuen Termin hinzufügen</h5>
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
                    <option>Raum 1</option>
                    <option>Raum 2</option>
                    <option>Raum 3</option>
                    <option>Raum 4</option>
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
              <button type="button" class="btn btn-primary" @click="${this.submit}">Speichern</button>
            </div>
          </div>
        </div>
      </div>
      `
  }

  submit(): void {
    if (this.form.reportValidity()) {
      const startDate = new Date(this.startInput.value);
      const endDate = new Date(this.endInput.value);
      EventService.createEvent({
        title: this.titleInput.value,
        room: this.roomInput.value,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate)
      } as IEvent);
    }
  }
}
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

  @query('#begin')
  beginInput!: HTMLInputElement;

  @query('#end')
  endInput!: HTMLInputElement;

  render() {
    return html`
    <div class="container-sm">
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
          <label for="begin" class="form-label">Start-Zeitpunkt</label>
          <input id="begin" required class="form-control" type="datetime-local">  
        </div>
        <div class="mb-3">
          <label for="end" class="form-label">End-Zeitpunkt</label>
          <input id="end" required class="form-control" type="datetime-local">  
        </div>
    
      </form>
      <button @click="${this.submit}" class="btn btn-primary">Speichern</button>
    </div>
      `
  }

  submit(): void {
    if (this.form.reportValidity()) {
      const beginDate = new Date(this.beginInput.value);
      const endDate = new Date(this.endInput.value);
      console.log({
        title: this.titleInput.value,
        room: this.roomInput.value,
        begin: Timestamp.fromDate(beginDate),
        end: Timestamp.fromDate(endDate)
      });
      EventService.createEvent({
        title: this.titleInput.value,
        room: this.roomInput.value,
        begin: Timestamp.fromDate(beginDate),
        end: Timestamp.fromDate(endDate)
      } as IEvent);
    }
  }
}
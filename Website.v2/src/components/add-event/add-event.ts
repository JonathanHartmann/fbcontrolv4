import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser } from '../../interfaces/user.interface';
import { EventService } from '../../services/event.service';

import './add-event.scss';

@customElement('add-event')
export default class AddEvent extends PageMixin(LitElement) {

  @property({ attribute: false })
  rooms: IRoom[] = [];
  
  @property({ attribute: false })
  user: IUser | undefined = undefined;

  @property({ attribute: false })
  seriesEvent = false;

  @property({ attribute: false })
  allDay = false;

  @property({ attribute: false })
  error = '';

  @query('form')
  form!: HTMLFormElement;

  @query('#title')
  titleInput!: HTMLInputElement;
  
  @query('#description')
  descriptionInput!: HTMLInputElement;

  @query('#room')
  roomInput!: HTMLInputElement;

  @query('#start-date')
  startDateInput!: HTMLInputElement;

  @query('#start-time')
  startTimeInput!: HTMLInputElement;

  @query('#end-date')
  endDateInput!: HTMLInputElement;

  @query('#end-time')
  endTimeInput!: HTMLInputElement;

  @query('#seriesNr')
  seriesNrInput!: HTMLInputElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  stateChanged(state: IState): void {
    this.rooms = state.rooms;
    this.user = state.user;
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
              <button type="button" class="close btn" id="close-button" data-dismiss="modal" @click=${this.resetForm} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form class="form">
                <div class="mb-3">
                  <label for="title">Titel ihrer Veranstaltung*</label>
                  <input required type="text" class="form-control" placeholder="Musikunterricht" id="title">
                </div>
                <div class="mb-3">
                  <label for="description">Beschreibung ihrer Veranstaltung</label>
                  <textarea class="form-control" aria-label="description" id="description" placeholder="description"></textarea>
                </div>
                <div class="mb-3">
                  <label for="room">Raum für ihre Veranstaltung*</label>
                  <select required class="form-control" id="room">
                    ${this.rooms.map(room => html`<option value=${room.id}>Raum ${room.title}</option>`)}
                  </select>
                </div>
                <div class="mb-3">
                  <label for="start-date" class="form-label">Start-Datum*</label>
                  <input id="start-date" required class="form-control" type="date" @input=${() => this.endDateInput.value = this.startDateInput.value}>  
                </div>
                ${!this.allDay? html`
                <div class="mb-3">
                  <label for="start-time" class="form-label">Start-Uhrzeit*</label>
                  <input id="start-time" required class="form-control" type="time" @input=${() => this.endTimeInput.value = this.addHoursToTime(this.startTimeInput.value)}>  
                </div>
                `:undefined}
                <div class="mb-3">
                  <label for="end-date" class="form-label">End-Datum*</label>
                  <input id="end-date" required class="form-control" type="date">  
                </div>
                ${!this.allDay? html`
                <div class="mb-3">
                  <label for="end-time" class="form-label">End-Uhrzeit*</label>
                  <input id="end-time" required class="form-control" type="time">  
                </div>
                `:undefined}
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" value=${this.allDay} id="allDay" @input=${() => this.allDay = !this.allDay}>
                  <label class="form-check-label" for="allDay">
                    Ganztägiger Termin
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" value=${this.seriesEvent} id="seriesEvent" @input=${() => this.seriesEvent = !this.seriesEvent}>
                  <label class="form-check-label" for="seriesEvent">
                    Serien Termin
                  </label>
                </div>
                ${this.seriesEvent? html`
                  <div class="mb-3">
                    <label for="seriesNr" class="form-label">Anzahl der Wiederholungen (Abstand: eine Woche, maximal 52 Wochen, minimal 1 Woche) </label>
                    <input id="seriesNr" class="form-control" type="number" min="1">  
                  </div>
                `:undefined}
              </form>

              <div class="message-box">
                ${ this.error !== '' ? html`
                <div  class="text-danger"> 
                  ${this.error}
                </div>
                ` : undefined}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" @click=${this.resetForm}>Abbrechen</button>
              <button type="button" class="btn btn-primary" @click="${this.submit}">Speichern</button>
            </div>
          </div>
        </div>
      </div>
      `
  }

  async submit(event: MouseEvent): Promise<void> {
    event.preventDefault();
    if (this.form.reportValidity()) {
      const seriesNrRaw = this.seriesNrInput ? Number(this.seriesNrInput.value) : 0
      const seriesNr = this.seriesEvent && seriesNrRaw > 0? seriesNrRaw : 0;

      const room = this.rooms.find((r) => r.id === this.roomInput.value)
      const startDate = this.startDateInput.value;
      const startTime = !this.allDay? this.startTimeInput.value : undefined;
      const endDate = this.endDateInput.value;
      const endTime = !this.allDay? this.endTimeInput.value : undefined;
      
      const start = !this.allDay? new Date(startDate + 'T' + startTime) : new Date(startDate);
      const end = !this.allDay? new Date(endDate + 'T' + endTime) : new Date(endDate);

      try {
        await EventService.createEvent({
          title: this.titleInput.value,
          description: this.descriptionInput.value,
          start: Timestamp.fromDate(start),
          end: Timestamp.fromDate(end),
          room: room?.title,
          roomId: room?.id,
          createdFrom: this.user?.name,
          createdFromId: this.user?.id,
          createdAt: Timestamp.now(),
          background: false,
          allDay: this.allDay
        } as IEvent, seriesNr);
        this.resetForm();
        document.getElementById('close-button')?.click();
      } catch(e) {
        console.error(e);
        this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
      }
    } else {
      this.error = 'Bitte füllen Sie alle mit \'*\' markierten Felder aus.';
    }
  }

  resetForm(): void {
    this.form.reset();
  }

  addHoursToTime(time: string): string {
    const nextHour = Number(time.slice(0,2)) + 1;
    return nextHour + ':' + time.slice(3,5);
  }
}
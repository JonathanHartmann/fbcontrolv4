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
  endlessEvent = false;

  @property({ attribute: false })
  duringHoliday = false;

  @property({ attribute: false })
  allDay = false;

  @property({ attribute: false })
  error = '';

  @property({ attribute: false })
  loading = false;

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

  @query('#seriesDate')
  seriesDateInput!: HTMLInputElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  stateChanged(state: IState): void {
    this.rooms = state.rooms.filter(r => !r.hidden);
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
            ${this.loading? html`
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                `:html`
              <form class="form">
                <div class="mb-3">
                  <label for="title">Titel ihrer Veranstaltung*</label>
                  <input required type="text" class="form-control" placeholder="Veranstaltungs Titel" id="title">
                </div>
                <div class="mb-3">
                  <label for="description">Beschreibung ihrer Veranstaltung</label>
                  <textarea class="form-control" aria-label="description" id="description" placeholder="Beschreibung"></textarea>
                </div>
                <div class="mb-3">
                  <label for="room">Raum für ihre Veranstaltung*</label>
                  <select required class="form-control" id="room">
                    ${this.rooms.map(room => html`<option value=${room.id}> ${room.title}</option>`)}
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
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value=${this.endlessEvent} id="endlessEvent" @input=${() => this.endlessEvent = !this.endlessEvent}>
                    <label class="form-check-label" for="endlessEvent">
                      Endloser Termin
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" value=${this.duringHoliday} id="duringHoliday" @input=${() => this.duringHoliday = !this.duringHoliday}>
                    <label class="form-check-label" for="duringHoliday">
                      Termin findet auch in den Ferien statt
                    </label>
                  </div>
                  ${!this.endlessEvent? html`
                  <div class="mb-3">
                    <label for="seriesDate" class="form-label">Letzter Termin (Der Termin wird wöchentlich bis zu diesem Tag wiederholt)</label>
                    <input id="seriesDate" class="form-control" type="date" min="1">  
                  </div>
                  `:undefined}
                `:undefined}
              </form>
              `}

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
      this.loading = true;
      const seriesDate = this.seriesDateInput ? new Date(this.seriesDateInput.value) : undefined;

      const room = this.rooms.find((r) => r.id === this.roomInput.value)
      const startDate = this.getDateFromInput(this.startDateInput.value);
      const startTime = !this.allDay? this.getTimeFromInput(this.startTimeInput.value) : undefined;
      const endDate = this.getDateFromInput(this.endDateInput.value);
      const endTime = !this.allDay? this.getTimeFromInput(this.endTimeInput.value) : undefined;
      
      const start = !this.allDay? new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2], startTime![0], startTime![1])) : new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2]));
      const end = !this.allDay? new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2], endTime![0], endTime![1])) : new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2]));
      const startTimeStamp = Timestamp.fromDate(start);
      const endTimeStamp = Timestamp.fromDate(end);

      if (startTimeStamp <= endTimeStamp) {
        try {
          await EventService.createEvent({
            title: this.titleInput.value,
            description: this.descriptionInput.value,
            start: startTimeStamp,
            end: endTimeStamp,
            room: room?.title,
            roomId: room?.id,
            createdFrom: this.user?.name,
            createdFromId: this.user?.id,
            createdAt: Timestamp.now(),
            background: false,
            allDay: this.allDay,
            seriesEndless: this.endlessEvent,
            seriesDuringHoliday: this.duringHoliday
          } as IEvent, seriesDate);
          this.loading = false;
          this.resetForm();
          document.getElementById('close-button')?.click();
        } catch(e) {
          console.error(e);
          this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
          this.loading = false;
        }
      } else {
        this.loading = false;
        this.error = 'Der Startzeitpunkt ist nach dem Endzeitpunkt.';
      }
    } else {
      this.error = 'Bitte füllen Sie alle mit \'*\' markierten Felder aus.';
    }
  }

  resetForm(): void {
    this.endlessEvent = false;
    this.seriesEvent = false;
    this.duringHoliday = false;
    this.allDay = false;
    // this.form.reset();
  }

  addHoursToTime(time: string): string {
    const nextHour = Number(time.slice(0,2)) + 1;
    return nextHour + ':' + time.slice(3,5);
  }

  getTimeFromInput(time: string): number[] {
    const arrTime = time.split(':');
    return arrTime.map(t => Number(t));
  }

  getDateFromInput(date: string): number[] {
    const arrDate = date.split('-');
    return arrDate.map(d => Number(d));
  }
}
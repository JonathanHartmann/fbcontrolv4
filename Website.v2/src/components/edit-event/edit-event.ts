import { Modal } from 'bootstrap';
import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { HOLIDAY_MOCK_ROOM, IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser } from '../../interfaces/user.interface';
import { store } from '../../redux/store';
import { EventService } from '../../services/event.service';

import './edit-event.scss';

@customElement('edit-event')
export default class EditEvent extends PageMixin(LitElement) {

  @property({ type: Object })
  event!: IEvent | undefined;

  @property({ attribute: false })
  rooms: IRoom[] = [];

  @property({ attribute: false })
  user: IUser | undefined = undefined;
  
  @property({ attribute: false })
  error: string | undefined = undefined;
  
  @property({ attribute: false })
  allDay = false;
  
  @property({ attribute: false })
  allFuture = false;
  
  @property({ attribute: false })
  loading = false;

  @property({ attribute: false })
  editModal: Modal | undefined = undefined;

  @property({ attribute: false })
  editMode = false;

  @query('form')
  form!: HTMLFormElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  @query('#edit-title')
  titleInput!: HTMLInputElement;
  
  @query('#edit-description')
  descriptionInput!: HTMLInputElement;

  @query('#edit-room')
  roomInput!: HTMLInputElement;

  @query('#edit-start-date')
  startDateInput!: HTMLInputElement;

  @query('#edit-start-time')
  startTimeInput!: HTMLInputElement;

  @query('#edit-end-date')
  endDateInput!: HTMLInputElement;

  @query('#edit-end-time')
  endTimeInput!: HTMLInputElement;

  @query('#edit-created-at')
  createdAtInput!: HTMLInputElement;

  @query('#edit-created-from')
  createdFromInput!: HTMLInputElement;

  @query('#edit-background')
  backgroundInput!: HTMLInputElement;

  stateChanged(state: IState): void {
    this.rooms = [HOLIDAY_MOCK_ROOM, ...state.rooms].filter(r => !r.hidden);
    this.user = state.user;
  }

  render(): TemplateResult {
    return html`
        <div class="modal" id="editEvent" tabindex="-1" role="dialog" aria-labelledby="editEventLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="editEventLabel">Buchung bearbeiten</h5>
                <button type="button" class="close btn" @click=${this.closeModal} aria-label="Close" id="close-button">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body ">
                ${this.loading? html`
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                `:html`
                <form class="form">
                  <div class="mb-3">
                    <label for="edit-title">Titel ihrer Veranstaltung</label>
                    <input required ?readonly=${!this.editMode} type="text" class="form-control" value=${this.event? this.event.title : ''} id="edit-title">
                  </div>
                <div class="mb-3">
                  <label for="edit-description">Beschreibung ihrer Veranstaltung</label>
                  <textarea ?readonly=${!this.editMode} class="form-control" aria-label="description" id="edit-description" placeholder="Nähere Beschreibung ihrer Veranstaltung..."></textarea>
                </div>
                  <div class="mb-3">
                    <label for="edit-room">Raum für ihre Veranstaltung</label>
                    <select class="form-control" id="edit-room" ?readonly=${!this.editMode}>
                      ${this.rooms.map(room => html`<option value=${room.id} ?selected=${this.event?.roomId == room.id}>${room.title === 'Ferien' ? '-': room.title}</option>`)}
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="edit-start-date" class="form-label">Start-Datum*</label>
                    <input ?readonly=${!this.editMode} id="edit-start-date" required class="form-control" type="date">  
                  </div>
                  ${!this.allDay? html`
                  <div class="mb-3">
                    <label for="edit-start-time-" class="form-label">Start-Uhrzeit*</label>
                    <input ?readonly=${!this.editMode} id="edit-start-time" required class="form-control" type="time">  
                  </div>
                  `:undefined}
                  <div class="mb-3">
                    <label for="edit-end-date" class="form-label">End-Datum*</label>
                    <input ?readonly=${!this.editMode} id="edit-end-date" required class="form-control" type="date">  
                  </div>
                  ${!this.allDay? html`
                  <div class="mb-3">
                    <label for="edit-end-time-" class="form-label">End-Uhrzeit*</label>
                    <input ?readonly=${!this.editMode} id="edit-end-time" required class="form-control" type="time">  
                  </div>
                  `:undefined}


                  <div class="mb-3">
                    <label for="edit-created-from">Erstellt von</label>
                    <input readonly type="text" class="form-control" value=${this.event? this.event.createdFrom : ''} id="edit-created-from">
                  </div>
                  <div class="mb-3">
                    <label for="edit-created-at" class="form-label">Erstellt am</label>
                    <input id="edit-created-at" readonly class="form-control" type="datetime-local">  
                  </div>

                  ${this.event && this.event.seriesId && this.editMode? html`
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" ?checked=${this.allFuture} id="edit-allFuture" @input=${() => this.allFuture = !this.allFuture}>
                    <label class="form-check-label" for="edit-allFuture">
                      Update auch alle zukünftigen Termine
                    </label>
                  </div>
                  `:undefined}

                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" ?checked=${this.allDay} id="edit-allDay" @input=${() => this.allDay = !this.allDay} ?disabled=${!this.editMode}>
                    <label class="form-check-label" for="edit-allDay">
                      Ganztägiger Termin
                    </label>
                  </div>

                  <div class="form-check" data-bs-toggle="tooltip" data-bs-placement="top" title="Es sind Ferien!">
                    <input class="form-check-input" type="checkbox" ?checked=${this.event? this.event.background : false} id="edit-background" @input=${() => this.event!.background = !this.event?.background} ?disabled=${!this.editMode}>
                    <label class="form-check-label" for="edit-background">
                      Es sind Ferien.
                    </label>
                </div>
                </form>
                `}
              </div>

              <div class="message-box mx-3">
                ${ this.error ? html`
                <div  class="text-danger">${this.error}</div>
                ` : undefined}
              </div>
            ${ this.editMode? html`
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click=${this.quitEditMode}}>Abbrechen</button>
              <button type="button" class="btn btn-primary" @click="${this.submit}">Speichern</button>
            </div>
            `:html`
            <div class="modal-footer">
              ${this.user?.role === 'admin' || this.user?.id === this.event?.createdFromId ? html`
              <button type="button" class="btn btn-danger" @click=${this.deleteEvent}>Löschen</button>
              <button type="button" class="btn btn-secondary" @click=${() =>this.editMode = !this.editMode}>Bearbeiten</button>
              `:undefined}
              <button type="button" class="btn btn-primary" @click="${this.closeModal}">OK</button>
            </div>
            `}
            </div>
          </div>
        </div>
        `;
  }

  async submit(): Promise<void> {
    if (this.form.reportValidity() && this.event) {
      const titleInput = document.getElementById('edit-title') as HTMLInputElement;
      const descriptionInput = document.getElementById('edit-description') as HTMLInputElement;
      const roomInput = document.getElementById('edit-room') as HTMLInputElement;
      const startDateInput = document.getElementById('edit-start-date') as HTMLInputElement;
      const endDateInput = document.getElementById('edit-end-date') as HTMLInputElement;
      const startTimeInput = document.getElementById('edit-start-time') as HTMLInputElement;
      const endTimeInput = document.getElementById('edit-end-time') as HTMLInputElement;
      const backgroundInput = document.getElementById('edit-background') as HTMLInputElement;
      
      const room = this.rooms.find((r) => r.id === roomInput.value)
      
      const startDate = this.getDateFromInput(startDateInput.value);
      const startTime = !this.allDay? this.getTimeFromInput(startTimeInput.value) : undefined;
      const endDate = this.getDateFromInput(endDateInput.value);
      const endTime = !this.allDay? this.getTimeFromInput(endTimeInput.value) : undefined;
      
      const start = !this.allDay? new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2], startTime?.[0], startTime?.[1])) : new Date(Date.UTC(startDate[0], startDate[1]));
      const end = !this.allDay? new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2], endTime?.[0], endTime?.[1])) : new Date(Date.UTC(endDate[0], endDate[1]));
      const startTimeStamp = Timestamp.fromDate(start);
      const endTimeStamp = Timestamp.fromDate(end);

      if (start <= end && room && this.user) {
        
        let newEvent: IEvent = {
          id: this.event.id,
          title: titleInput.value,
          description: descriptionInput.value,
          start: startTimeStamp,
          end: endTimeStamp,
          room: room.title === HOLIDAY_MOCK_ROOM.title? '' : room.title,
          roomId: room.id === HOLIDAY_MOCK_ROOM.id? '' : room.id,
          createdFrom: this.user.name,
          createdFromId: this.user.id,
          background: backgroundInput.checked,
          allDay: this.allDay,
          seriesEndless: this.event.seriesEndless,
          seriesDuringHoliday: this.event.seriesDuringHoliday
        }
        this.event = newEvent;
        
        if (this.allFuture) {
          newEvent = {
            ...newEvent,
            seriesId: this.event.seriesId,
            seriesNr: this.event.seriesNr
          }
          const events = store.getState().events.filter(e => e.seriesId === this.event?.seriesId && e.start.toDate() > this.event!.start.toDate());
          events.sort((a, b) => {
            if (a.start.toDate() < b.start.toDate()) {
              return 1;
            } else if (a.start.toDate() > b.start.toDate()) {
              return -1;
            } else {
              return 0;
            }
          });
          this.event = {
            ...this.event,
            createdAt: Timestamp.now()
          }
          const lastDate = events[0].start.toDate()
          lastDate.setDate(lastDate.getDate() + 1);
          try {
            EventService.deleteEvent(this.event.id, true);
            EventService.createEvent(this.event, lastDate);
            this.closeModal();
          } catch(e) {
            console.error(e);
            this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
          }
        } else if (!this.event.seriesId) {
          try {
            EventService.updateEvent(newEvent);
            this.closeModal();
          } catch(e) {
            console.error(e);
            this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
          }
        } 
      } else {
        this.error = 'Das Start-Datum liegt nicht vor dem End-Datum!';
      }
    }
  }

  openModal(event: IEvent | undefined): void {
    if (event) {
      this.event = event;
    }
    if (!this.editModal) {
      const element = document.getElementById('editEvent');
      if (element) {
        this.editModal = new Modal(element);
      }
    }
    this.editModal?.show();
    this.setData();
  }

  closeModal(): void {
    if (!this.editModal) {
      const element = document.getElementById('editEvent');
      if (element) {
        this.editModal = new Modal(element);
      }
    }
    this.quitEditMode();
    this.editModal?.hide();
  }
  
  setData(): void {
    if (this.event) {
      this.allDay = this.event.allDay;
      this.startDateInput.value = this.getDate(this.event.start.toDate());
      this.endDateInput.value = this.getDate(this.event.end.toDate());
      this.descriptionInput.value = this.event.description;
      if (!this.allDay) {
        this.startTimeInput.value = this.getTime(this.event.start.toDate());
        this.endTimeInput.value = this.getTime(this.event.end.toDate());
      }
      if (this.event.createdAt) {
        this.createdAtInput.value = this.getDate(this.event.createdAt.toDate()) + 'T' + this.getTime(this.event.createdAt.toDate());
      }
    }
  }

  deleteEvent(): void {
    if (this.event) {
      const deleteSingle = confirm('Soll diese Buchung wirklich gelöscht werden?');
      if (this.event.seriesId) {
        const deleteFuture = confirm('Sollen zusätzlich alle Zukünftigen Buchungen gelöscht werden?');
        if (deleteFuture) {
          EventService.deleteEvent(this.event.id, true);
          this.closeModal();
          return;
        }
      }
      if (deleteSingle == true) {
        EventService.deleteEvent(this.event.id);
        this.closeModal();
      }
    }
  }

  quitEditMode(): void {
    this.setData();
    this.editMode = false;
    this.error = undefined;
  }

  getTime(date: Date): string {
    if (date) {
      let hours = date.getUTCHours().toString();
      let min = date.getMinutes().toString();
      if (hours.length === 1) {
        hours = '0' + hours;
      }
      if (min.length === 1) {
        min = '0' + min;
      }
      return `${hours}:${min}`;
    } else {
      return '';
    }
  }

  getDate(date: Date, addDays = 0): string {
    if (date) {
      const year = date.getFullYear();
      let month = (date.getMonth() + 1).toString();
      date.setDate(date.getDate() + addDays);
      let day = date.getDate().toString();
  
      if (month.length === 1) {
        month = '0' + month;
      }
      if (day.length === 1) {
        day = '0' + day;
      }
  
      return `${year}-${month}-${day}`;
    } else {
      return '';
    }
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
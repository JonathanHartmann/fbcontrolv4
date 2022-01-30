import { Modal } from 'bootstrap';
import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { HOLIDAY_MOCK_ROOM, IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser, ROLE } from '../../interfaces/user.interface';
import { store } from '../../redux/store';
import { EventService } from '../../services/event.service';
import { getDisplayDate, getTime } from '../../utils/utc-helper';

import './edit-event.scss';

@customElement('edit-event')
export default class EditEvent extends PageMixin(LitElement) {

  @property({ type: Object })
  event!: IEvent | undefined;

  @property({ attribute: false })
  rooms: IRoom[] = [];

  @property({ attribute: false })
  users: IUser[] = [];

  @property({ attribute: false })
  user: IUser | undefined = undefined;
  
  @property({ attribute: false })
  error: string | undefined = undefined;
  
  @property({ attribute: false })
  deleteMode = false;
  
  @property({ attribute: false })
  deleteAll = false;
  
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
    this.users = state.users;
  }

  render(): TemplateResult {
    return html`
        <div class="modal" id="editEvent" tabindex="-1" role="dialog" aria-labelledby="editEventLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            ${this.deleteMode? html`
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="editEventLabel">Buchung "${this.event?.title}" löschen?</h5>
                  <button type="button" class="close btn" @click=${this.quitDeleteMode} aria-label="Close" id="close-button">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <h3>Soll dieser Termin gelöscht werden?</h3>
                  ${this.event?.seriesId? html`
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ?checked=${this.deleteAll} id="delete-all" @input=${() => this.deleteAll = !this.deleteAll}>
                        <label class="form-check-label" for="delete-all">
                          Sollen zusätzlich alle Zukünftigen Buchungen gelöscht werden?
                        </label>
                      </div>
                  `:undefined}
                </div>
                ${this.loading? html`
                <div class="d-flex justify-content-center">
                  <span>Termine werden gelöscht... </span>
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                `: html`
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click=${this.quitDeleteMode}>Abbrechen</button>
                    <button type="button" class="btn btn-danger" @click=${this.submitDelete}>Löschen</button>
                  </div>
                  `}
              </div>
            ` : html`
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
                      ${this.user?.role == ROLE.ADMIN && this.editMode? html`
                        <label for="edit-room">Raum für ihre Veranstaltung</label>
                        <select class="form-control" id="edit-room" ?readonly=${!this.editMode}>
                          ${this.rooms.map(room => html`<option value=${room.id} ?selected=${this.event?.roomId == room.id}>${room.title === 'Ferien' ? '-': room.title}</option>`)}
                        </select>
                      `:html`
                        <label for="edit-room-ro">Raum für ihre Veranstaltung</label>
                        <input readonly type="text" class="form-control" value=${this.event? this.event.room : ''} id="edit-created-from-ro">
                      `}
                    </div>

                    <div class="mb-3">
                      <label for="edit-start-date" class="form-label">Start-Datum*</label>
                      <input ?readonly=${!this.editMode} id="edit-start-date" required class="form-control" type="date">  
                    </div>
                    ${!this.allDay && html`
                    <div class="mb-3">
                      <label for="edit-start-time-" class="form-label">Start-Uhrzeit*</label>
                      <input ?readonly=${!this.editMode} id="edit-start-time" required class="form-control" type="time">  
                    </div>
                    `}
                    <div class="mb-3">
                      <label for="edit-end-date" class="form-label">End-Datum*</label>
                      <input ?readonly=${!this.editMode} id="edit-end-date" required class="form-control" type="date">  
                    </div>
                    ${!this.allDay && html`
                    <div class="mb-3">
                      <label for="edit-end-time-" class="form-label">End-Uhrzeit*</label>
                      <input ?readonly=${!this.editMode} id="edit-end-time" required class="form-control" type="time">  
                    </div>
                    `}


                    <div class="mb-3">
                      ${this.user?.role == ROLE.ADMIN && this.editMode? html`
                        <label for="edit-created-from">Erstellt von</label>
                        <select class="form-control" id="edit-created-from">
                          ${this.users.map(u => html`<option value=${u.id} ?selected=${this.event?.createdFromId == u.id}>${u.name}</option>`)}
                        </select>
                      `:html`
                        <label for="edit-created-from-ro">Erstellt von</label>
                        <input readonly type="text" class="form-control" value=${this.event? this.event.createdFrom : ''} id="edit-created-from-ro">
                      `}
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
            `}
          </div>
        </div>
        `;
  }

  async submit(): Promise<void> {
    this.error = undefined;
    if (this.form.reportValidity() && this.event && this.user) {
      this.loading = true;

      const titleInput = document.getElementById('edit-title') as HTMLInputElement;
      const descriptionInput = document.getElementById('edit-description') as HTMLInputElement;
      const roomInput = document.getElementById('edit-room') as HTMLInputElement;
      const startDateInput = document.getElementById('edit-start-date') as HTMLInputElement;
      const endDateInput = document.getElementById('edit-end-date') as HTMLInputElement;
      const startTimeInput = document.getElementById('edit-start-time') as HTMLInputElement;
      const endTimeInput = document.getElementById('edit-end-time') as HTMLInputElement;
      const backgroundInput = document.getElementById('edit-background') as HTMLInputElement;
      const createdFromInput = document.getElementById('edit-created-from') as HTMLInputElement;
      
      const room = this.rooms.find((r) => r.id === roomInput.value)

      const startDate = this.getDateFromInput(startDateInput.value);
      const endDate = this.getDateFromInput(endDateInput.value);
      let startMillis = 0;
      let endMillis = 0;

      if (this.allDay) {
        startMillis = new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2])).getTime();
        endMillis = new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2])).getTime();

      } else {
        const startTime = this.getTimeFromInput(startTimeInput.value);
        const endTime = this.getTimeFromInput(endTimeInput.value);

        startMillis = new Date(Date.UTC(startDate[0], startDate[1]-1, startDate[2], startTime[0], startTime[1])).getTime();
        endMillis = new Date(Date.UTC(endDate[0], endDate[1]-1, endDate[2], endTime[0], endTime[1])).getTime();
        
      }
      const startTimeStamp = Timestamp.fromMillis(startMillis);
      const endTimeStamp = Timestamp.fromMillis(endMillis);

      let newUser = this.users.find(u => u.id == createdFromInput.value)
      newUser = newUser ? newUser : this.user;
      const newUserId = this.user.role == ROLE.ADMIN? newUser.id : this.user.id; 
      const newUserName = this.user.role == ROLE.ADMIN? newUser.name : this.user.name; 

      if (startTimeStamp <= endTimeStamp && room) {
        
        let newEvent: IEvent = {
          id: this.event.id,
          title: titleInput.value,
          description: descriptionInput.value,
          start: startTimeStamp,
          end: endTimeStamp,
          room: room.title === HOLIDAY_MOCK_ROOM.title? '' : room.title,
          roomId: room.id === HOLIDAY_MOCK_ROOM.id? '' : room.id,
          createdFrom: newUserName,
          createdFromId: newUserId,
          background: backgroundInput.checked,
          allDay: this.allDay,
          seriesEndless: this.event.seriesEndless,
          seriesDuringHoliday: this.event.seriesDuringHoliday,
          createdAt: Timestamp.now()
        }
        
        if (this.allFuture) {
          newEvent = {
            ...newEvent,
            seriesId: this.event.seriesId,
            seriesNr: this.event.seriesNr
          }
          this.event = newEvent;
          const events = store.getState().events.filter(e => {
            if (this.event) {
              if (
                e.seriesId &&
                e.seriesId === this.event.seriesId &&
                e.start.toDate() > this.event.start.toDate()
              ) {
                return true;
              }
            }
            return false;
          });
          events.sort((a, b) => {
            if (a.start.toDate() < b.start.toDate()) {
              return 1;
            } else if (a.start.toDate() > b.start.toDate()) {
              return -1;
            } else {
              return 0;
            }
          });
          const lastDate = events[0].start.toDate();
          lastDate.setDate(lastDate.getDate() + 1);
          try {
            EventService.deleteEvent(this.event.id, true);
            EventService.createEvent(this.event, lastDate);
            this.closeModal();
          } catch(e) {
            console.error(e);
            this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
            this.loading = false;
          }
        } else {
          this.event = newEvent;
          try {
            EventService.updateEvent(newEvent);
            this.closeModal();
          } catch(e) {
            console.error(e);
            this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
            this.loading = false;
          }
        } 
      } else {
        this.error = 'Das Start-Datum liegt nicht vor dem End-Datum!';
      }
    } else {
      this.error = 'Etwas ist schiefgelaufen, versuche es später nochmal.';
      if (this.event) {
        console.error('The event object is undefined');
      }
      if (this.user) {
        console.error('The user object is undefined');
      }
    }
    this.loading = false;
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
    if (this.editModal) {
      this.editModal.show();
      this.setData();
    }
  }

  closeModal(): void {
    if (!this.editModal) {
      const element = document.getElementById('editEvent');
      if (element) {
        this.editModal = new Modal(element);
      }
    }
    this.editModal?.hide();
    this.quitEditMode();
  }
  
  setData(): void {
    if (this.event) {
      this.allDay = this.event.allDay;
      this.startDateInput.value = getDisplayDate(new Date(this.event.start.seconds * 1000));
      this.endDateInput.value = getDisplayDate(new Date(this.event.end.seconds * 1000));
      this.descriptionInput.value = this.event.description;
      if (!this.allDay) {
        this.startTimeInput.value = getTime(this.event.start.toDate());
        this.endTimeInput.value = getTime(this.event.end.toDate());
      }
      if (this.event.createdAt) {
        this.createdAtInput.value = getDisplayDate(this.event.createdAt.toDate()) + 'T' + getTime(this.event.createdAt.toDate());
      }
    }
  }

  deleteEvent(): void {
    if (this.event) {
      this.deleteMode = true;
    }
  }

  async submitDelete(): Promise<void> {
    if (this.event) {
      this.loading = true;
      await EventService.deleteEvent(this.event.id, this.event.seriesId? this.deleteAll : false);
      this.loading = false;
      this.closeModal();
    }
  }

  quitEditMode(): void {
    try {
      this.setData();
    } catch {
      // wenn ein event gelöscht wurde, können die Daten nicht nue gesetzt werden
    }
    this.editMode = false;
    this.deleteMode = false;
    this.deleteAll = false;
    this.error = undefined;
  }

  quitDeleteMode(): void {
    this.deleteMode = false;
    this.deleteAll = false;
    this.error = undefined;
    this.closeModal();
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
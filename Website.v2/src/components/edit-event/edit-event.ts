import { Modal } from 'bootstrap';
import { Timestamp } from 'firebase/firestore';
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { IEvent } from '../../interfaces/event.interface';
import { HOLIDAY_MOCK_ROOM, IRoom } from '../../interfaces/room.interface';
import { IState } from '../../interfaces/state.interface';
import { IUser } from '../../interfaces/user.interface';
import { EventService } from '../../services/event.service';

import './edit-event.scss';

@customElement('edit-event')
export default class EditEvent extends PageMixin(LitElement) {

  @property({ type: Object })
  event!: IEvent;

  @property({ attribute: false })
  rooms: IRoom[] = [];

  @property({ attribute: false })
  user: IUser | undefined = undefined;
  
  @property({ attribute: false })
  error: string | undefined = undefined;
  
  @property({ attribute: false })
  editModal: Modal | undefined = undefined;

  @query('form')
  form!: HTMLFormElement;

  @query('#createEventModal')
  createEventModal!: HTMLElement;

  stateChanged(state: IState): void {
    this.rooms = [HOLIDAY_MOCK_ROOM, ...state.rooms];
    this.user = state.user;
  }

  render(): TemplateResult {
    if (this.event) {
      return html`
        <!-- Button trigger modal -->
        <button type="button" class="btn btn-light" @click=${this.openModal}>
          Bearbeiten
        </button>

        <div class="modal" id=${'editEvent' + this.event.id} tabindex="-1" role="dialog" aria-labelledby=${'editEventLabel' + this.event.id} aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id=${'editEventLabel' + this.event.id}>Buchung bearbeiten</h5>
                <button type="button" class="close btn" @click=${this.closeModal} aria-label="Close" id="close-button">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body ">
                <form class="form">
                  <div class="mb-3">
                    <label for=${'title' + this.event.id}>Titel ihrer Veranstaltung</label>
                    <input required type="text" class="form-control" value=${this.event.title} id=${'title' + this.event.id}>
                  </div>
                <div class="mb-3">
                  <label for=${'description' + this.event.id}>Beschreibung ihrer Veranstaltung</label>
                  <textarea class="form-control" aria-label="description" id=${'description' + this.event.id} placeholder="Nähere Beschreibung ihrer Veranstaltung..."></textarea>
                </div>
                  <div class="mb-3">
                    <label for=${'room' + this.event.id}>Raum für ihre Veranstaltung</label>
                    <select class="form-control" id=${'room' + this.event.id}>
                      ${this.rooms.map(room => html`<option value=${room.id} ?selected=${this.event?.roomId == room.id}>${room.title === 'Ferien' ? '-': room.title}</option>`)}
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for=${'start' + this.event.id} class="form-label">Start-Zeitpunkt</label>
                    <input id=${'start' + this.event.id} required class="form-control" type="datetime-local">  
                  </div>
                  <div class="mb-3">
                    <label for=${'end' + this.event.id} class="form-label">End-Zeitpunkt</label>
                    <input id=${'end' + this.event.id} required class="form-control" type="datetime-local">  
                  </div>
                  <div class="form-check" data-bs-toggle="tooltip" data-bs-placement="top" title="An Ferien können im gesamten Gebäude Keine Räume gebucht werden!">
                  <input class="form-check-input" type="checkbox" value=${this.event.background} id=${'background' + this.event.id}>
                  <label class="form-check-label" for=${'background' + this.event.id}>
                    Gebäude ist in diesem Zeitraum geschlossen.
                  </label>
                </div>
                </form>
              </div>
              <div class="message-box mx-3">
              ${ this.error ? html`
              <div  class="text-danger">${this.error}</div>
              ` : undefined}
            </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click=${this.closeModal}>Abbrechen</button>
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

  firstUpdated(): void {
    if (this.event) {
      const startInput = document.getElementById('start' + this.event.id) as HTMLInputElement;
      const endInput = document.getElementById('end' + this.event.id) as HTMLInputElement;
      const descriptionInput = document.getElementById('description' + this.event.id) as HTMLInputElement;
      const backgroundInput = document.getElementById('background' + this.event.id) as HTMLInputElement;
      startInput.setAttribute('value', this.event.start.toDate().toISOString().slice(0, -1));
      endInput.setAttribute('value', this.event.end.toDate().toISOString().slice(0, -1));
      descriptionInput.value = this.event.description;
      backgroundInput.checked = this.event.background;
    }
  }

  async submit(): Promise<void> {
    if (this.form.reportValidity() && this.event) {
      const titleInput = document.getElementById('title' + this.event.id) as HTMLInputElement;
      const descriptionInput = document.getElementById('description' + this.event.id) as HTMLInputElement;
      const roomInput = document.getElementById('room' + this.event.id) as HTMLInputElement;
      const startInput = document.getElementById('start' + this.event.id) as HTMLInputElement;
      const endInput = document.getElementById('end' + this.event.id) as HTMLInputElement;
      const backgroundInput = document.getElementById('background' + this.event.id) as HTMLInputElement;

      const room = this.rooms.find((r) => r.id === roomInput.value)
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);

      if (startDate < endDate) {
        try {
          await EventService.updateEvent({
            id: this.event.id,
            title: titleInput.value,
            description: descriptionInput.value,
            start: Timestamp.fromDate(startDate),
            end: Timestamp.fromDate(endDate),
            room: room?.title === HOLIDAY_MOCK_ROOM.title? '' : room?.title,
            roomId: room?.id === HOLIDAY_MOCK_ROOM.id? '' : room?.id,
            createdFrom: this.user?.name,
            createdFromId: this.user?.id,
            background: backgroundInput.checked
          } as IEvent);
          this.closeModal();
        } catch(e) {
          console.error(e);
          this.error = 'Der Termin ist entweder in den Ferien oder zur selben Zeit ist bereits der ausgewählte Raum ausgebucht.';
        }
      } else {
        this.error = 'Das Start-Datum liegt nicht vor dem End-Datum!';
      }
    }
  }

  openModal(): void {
    if (!this.editModal) {
      const element = document.getElementById('editEvent' + this.event.id);
      if (element) {
        this.editModal = new Modal(element);
      }
    }
    this.editModal?.show();
  }

  closeModal(): void {
    if (!this.editModal) {
      const element = document.getElementById('editEvent' + this.event.id);
      if (element) {
        this.editModal = new Modal(element);
      }
    }
    this.editModal?.hide();
  }
}
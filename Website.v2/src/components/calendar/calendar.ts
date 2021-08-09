/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { BASE_OPTION_REFINERS, Calendar, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import deLocale from '@fullcalendar/core/locales/de';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IRoom } from '../../interfaces/room.interface';

import './calendar.scss';

(BASE_OPTION_REFINERS as any).schedulerLicenseKey = 'CC-Attribution-NonCommercial-NoDerivatives';

@customElement('web-calendar')
export default class WebCalendar extends PageMixin(LitElement) {

  @query('#calendar')
  calendarElement!: HTMLElement;

  calendar: Calendar | undefined = undefined;

  @property({ type: Boolean })
  smallScreen = false;

  @property({ attribute: false })
  rooms: Map<string, {room: IRoom, checked: boolean}> = new Map();

  @property({ attribute: false })
  events: IEvent[] = [];

  @property({ attribute: false })
  selectedEvent: EventApi | undefined = undefined;

  constructor() {
    super();
    this.smallScreen = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        this.smallScreen = true;
      } else {
        this.renderCalendar();
      }
    });
  }

  render(): TemplateResult {
    return html`
      <div class="room-filter my-3">
        <h4>Zeige Buchungen für folgende Räume an:</h4>
        ${[...this.rooms.values()].map(roomObj => {
    const room = roomObj.room;
    return html`
        <div class="form-check form-check-inline user-select-none">
          <input class="form-check-input" type="checkbox" id=${'room-' + room.id} value=${room.id} ?checked=${roomObj.checked} @input=${() => this.roomFilter(room.id)}>
          <label class="form-check-label" for=${'room-' + room.id}>${room.title}</label>
        </div>`;
  })}
      </div>
      <div class="action-section my-3">
        <add-event></add-event>
      </div>
      ${!this.smallScreen? html`
        <div id="calendar"></div>
      `: undefined}
      
      
      <div class="modal fade" id="eventDetails" tabindex="-1" aria-labelledby="exampleModalLabel" aria-modal="true"
          role="dialog">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Details zu der Veranstaltung: ${this.selectedEvent? this.selectedEvent.title: ''}</h5>
                      <button type="button" class="close btn" data-dismiss="modal" aria-label="Close" @click=${this.closeModal}>
                        <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                  <form class="form">
                    <div class="mb-3">
                      <label for="details-title">Titel der Veranstaltung</label>
                      <input readonly type="text" class="form-control" value=${this.selectedEvent? this.selectedEvent.title: ''} id="details-title">
                    </div>
                    <div class="mb-3">
                      <label for="details-description">Beschreibung der Veranstaltung</label>
                      <textarea readonly class="form-control" aria-label="description" id="details-description"></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="details-room">Raum für der Veranstaltung</label>
                      <input readonly type="text" class="form-control" value=${this.selectedEvent? this.selectedEvent.extendedProps.room:''} id="details-room">
                    </div>
                    <div class="mb-3">
                      <label for="details-created">Erstellt von</label>
                      <input readonly type="text" class="form-control" value=${this.selectedEvent? this.selectedEvent.extendedProps.createdFrom:''} id="details-created">
                    </div>
                    <div class="mb-3">
                      <label for="details-start" class="form-label">Start-Zeitpunkt</label>
                      <input id="details-start" readonly class="form-control" type="datetime-local">  
                    </div>
                    <div class="mb-3">
                      <label for="details-end" class="form-label">End-Zeitpunkt</label>
                      <input id="details-end" readonly class="form-control" type="datetime-local">  
                    </div>
                  </form>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-primary" @click=${this.closeModal}>Ok</button>
                  </div>
              </div>
          </div>
      </div>
      <div class="modal-backdrop fade show" id="backdrop" @click=${this.closeModal} style="display: none;"></div>
      `
  }

  firstUpdated(): void {
    this.renderCalendar();

    // Get the modal
    const modal = document.getElementById('eventDetails');
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
      if (event.target == modal) {
        this.closeModal();
      }
    }
  }

  

  stateChanged(state: IState): void {
    if (state.events.length > 0) {
      this.events = state.events;
      this.setEvents(this.events);
    }
    if (state.rooms.length > 0) {
      state.rooms.forEach(room => {
        this.rooms.set(room.id, {room, checked: this.rooms.get(room.id) ? !!this.rooms.get(room.id)?.checked : true});
      });
      this.filterEvents();
      this.setResources();
      this.requestUpdate();
    }
  }

  roomFilter(roomId: string): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const roomObj = this.rooms.get(roomId)!;
    this.rooms.set(roomId, {room: roomObj.room, checked: !roomObj.checked});
    this.setResources();
    this.filterEvents();
  }

  filterEvents(): void {
    const filteredEvents = this.events.filter(event => this.rooms.get(event.roomId)?.checked);
    this.setEvents(filteredEvents);
  }

  setEvents(events: IEvent[]): void {
    this.calendar?.removeAllEvents();
    events.forEach(event => {
      this.calendar?.addEvent({
        title: event.title,
        start: event.start.seconds * 1000,
        end: event.end.seconds * 1000,
        createdFrom: event.createdFrom,
        resourceId: event.roomId,
        description: event.description,
        room: event.room
      });
    });
  }

  setResources(): void {
    const rooms = [...this.rooms.values()].filter(r => r.checked).map(r => r.room);
    this.calendar?.getResources().forEach(r => r.remove());
    rooms.forEach(room => {
      this.calendar?.addResource(room);
    })
  }

  renderCalendar(): void {
    this.calendar = new Calendar(this.calendarElement, {
      plugins: [ dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,resourceTimeGridDay'
      },
      initialView: 'resourceTimeGridDay',
      locales: [ deLocale ],
      locale: 'de',
      initialDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      themeSystem: 'bootstrap',
      eventClick: (info) => {
        this.openModal(info.event);
      }    
    });
    this.calendar.render();
    this.calendar.updateSize();
  }



  openModal(event: EventApi): void {
    this.selectedEvent = event;
    const startInput = document.getElementById('details-start') as HTMLInputElement;
    const endInput = document.getElementById('details-end') as HTMLInputElement;
    const descriptionInput = document.getElementById('details-description') as HTMLInputElement;
    startInput.setAttribute('value', this.selectedEvent.start? this.selectedEvent.start.toISOString().slice(0, -1) : '');
    endInput.setAttribute('value', this.selectedEvent.end? this.selectedEvent.end.toISOString().slice(0, -1) :  '');
    const desc = this.selectedEvent.extendedProps.description;
    descriptionInput.value = desc ? desc : '';
    document.getElementById('backdrop')!.style.display = 'block';
    document.getElementById('eventDetails')!.style.display = 'block';
    document.getElementById('eventDetails')!.classList.add('show');
  }
  closeModal(): void {
    document.getElementById('backdrop')!.style.display = 'none';
    document.getElementById('eventDetails')!.style.display = 'none';
    document.getElementById('eventDetails')!.classList.remove('show');
  }
}
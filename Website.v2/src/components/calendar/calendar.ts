/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';
import { Modal, Tooltip } from 'bootstrap';
import { PageMixin } from '../../client-packages/page.mixin';
import { BASE_OPTION_REFINERS, Calendar, CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import deLocale from '@fullcalendar/core/locales/de';
import adaptivePlugin from '@fullcalendar/adaptive'
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IRoom } from '../../interfaces/room.interface';

import './calendar.scss';
import { EventService } from '../../services/event.service';
import { store } from '../../redux/store';
import { IUser } from '../../interfaces/user.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BASE_OPTION_REFINERS as any).schedulerLicenseKey = 'CC-Attribution-NonCommercial-NoDerivatives';

@customElement('web-calendar')
export default class WebCalendar extends PageMixin(LitElement) {

  @query('#calendar')
  calendarElement!: HTMLElement;
  
  calendar: Calendar | undefined = undefined;

  @property({ type: Boolean })
  smallScreen = false;

  @property({ attribute: false })
  user: IUser | undefined = undefined;

  @property({ attribute: false })
  rooms: Map<string, {room: IRoom, checked: boolean}> = new Map();

  @property({ attribute: false })
  events: IEvent[] = [];

  @property({ attribute: false })
  selectedCalendarEvent: EventApi | undefined = undefined;

  @property({ attribute: false })
  selectedEvent: IEvent | undefined = undefined;

  @property({ attribute: false })
  detailsModal: Modal | undefined = undefined;

  constructor() {
    super();
    this.smallScreen = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      if (this.calendar) {
        this.calendar.render();
      }
    });
  }

  render(): TemplateResult {
    return html`
        <div class="row">
            <div class="room-filter d-flex flex-column bd-highlight">
              <div class="action-section mb-3">
                <add-event></add-event>
              </div>
              <h4>Angezeigete Räume</h4>
              ${[...this.rooms.values()].map(roomObj => {const room = roomObj.room; return html`
              <div class="form-check form-check-inline user-select-none">
                <input class="form-check-input" type="checkbox" id=${'room-' + room.id} value=${room.id} ?checked=${roomObj.checked} @input=${() => this.roomFilter(room.id)} style=${styleMap({ borderColor: room.eventColor, backgroundColor: room.eventColor})}>
                <label class="form-check-label" for=${'room-' + room.id}>${room.title}</label>
              </div>`;})}
            </div>

          <div class="calendar-section">
            <div id="calendar"></div>
          </div>

        </div>


      
      <div class="modal" id="eventDetails" tabindex="-1" aria-labelledby="exampleModalLabel" aria-modal="true" role="dialog">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Details zu der Veranstaltung: ${this.selectedCalendarEvent? this.selectedCalendarEvent.title: ''}</h5>
                      <button type="button" class="close btn" aria-label="Close" @click=${this.closeModal}>
                        <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                  <form class="form">
                    <div class="mb-3">
                      <label for="details-title">Titel der Veranstaltung</label>
                      <input readonly type="text" class="form-control" value=${this.selectedCalendarEvent? this.selectedCalendarEvent.title: ''} id="details-title">
                    </div>
                    <div class="mb-3">
                      <label for="details-description">Beschreibung der Veranstaltung</label>
                      <textarea readonly class="form-control" aria-label="description" id="details-description"></textarea>
                    </div>
                    <div class="mb-3">
                      <label for="details-room">Raum für der Veranstaltung</label>
                      <input readonly type="text" class="form-control" value=${this.selectedCalendarEvent? this.selectedCalendarEvent.extendedProps.room:''} id="details-room">
                    </div>
                    <div class="mb-3">
                      <label for="details-created">Erstellt von</label>
                      <input readonly type="text" class="form-control" value=${this.selectedCalendarEvent? this.selectedCalendarEvent.extendedProps.createdFrom:''} id="details-created">
                    </div>
                    <div class="mb-3">
                      <label for="details-created-at" class="form-label">Erstellt am</label>
                      <input id="details-created-at" readonly class="form-control" type="datetime-local">  
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
                    ${(this.user?.role === 'admin' || this.user?.id === this.selectedCalendarEvent?.extendedProps.createdFromId) && this.selectedEvent !== undefined? html`
                    <td class="event-actions">
                      <button type="button" class="btn btn-danger" @click=${this.deleteEvent}>Löschen</button>
                      <edit-event .event=${this.selectedEvent} class="align-self-center me-3"></edit-event>
                    </td>
                    `: undefined}
                    <button type="button" class="btn btn-primary" @click=${this.closeModal}>Ok</button>
                  </div>
              </div>
          </div>
      </div>
      `
  }

  firstUpdated(): void {
    this.renderCalendar();
    this.detailsModal = new Modal(document.getElementById('eventDetails')!);
    this.user = store.getState().user;
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
    if (state.events.length >= 0) {
      this.events = state.events;
      this.setEvents(state.events);
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
    const roomObj = this.rooms.get(roomId);
    if (roomObj) {
      this.rooms.set(roomId, {room: roomObj.room, checked: !roomObj.checked});
      this.setResources();
      this.filterEvents();
    }
  }

  filterEvents(): void {
    const filteredEvents = this.events.filter(event => event.background || this.rooms.get(event.roomId)?.checked);
    this.setEvents(filteredEvents);
  }

  setEvents(events: IEvent[]): void {
    this.calendar?.removeAllEvents();
    events.forEach(event => {
      const start = new Date(event.start.seconds * 1000);
      const end = new Date(event.end.seconds * 1000);
      const addEvent = {
        title: event.title,
        start: event.background? this.getDate(start) : start,
        end: event.background? this.getDate(end, 1) : end,
        createdFrom: event.createdFrom,
        resourceId: event.roomId,
        display: event.background ? 'background' : undefined,
        description: event.description,
        room: event.room,
        // allDay: event.allDay,
        color: this.rooms.get(event.roomId) ? this.rooms.get(event.roomId)!.room.eventColor : '#b1b1b1',
        createdFromId: event.createdFromId,
        id: event.id,
        seriesId: event.seriesId,
        createdAt: event.createdAt?.toDate()
      }
      if (event.background) {
        this.calendar?.addEvent({
          ...addEvent,
          allDay: event.allDay,
        });
      }
      this.calendar?.addEvent(addEvent);
    });
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new Tooltip(tooltipTriggerEl);
    });
  }


  setResources(): void {
    const rooms = [...this.rooms.values()].filter(r => r.checked).map(r => r.room);
    this.calendar?.getResources().forEach(r => r.remove());
    rooms.forEach(room => {
      this.calendar?.addResource({...room});
    });
  }

  deleteEvent(): void {
    if (this.selectedCalendarEvent) {
      const deleteSingle = confirm('Soll diese Buchung wirklich gelöscht werden?');
      if (this.selectedCalendarEvent.extendedProps.seriesId) {
        const deleteFuture = confirm('Sollen zusätzlich alle Zukünftigen Buchungen gelöscht werden?');
        if (deleteFuture) {
          EventService.deleteEvent(this.selectedCalendarEvent.id, true);
          this.closeModal();
          return;
        }
      }
      if (deleteSingle == true) {
        EventService.deleteEvent(this.selectedCalendarEvent.id);
        this.closeModal();
      }
    }
  }

  renderCalendar(): void {
    const navEle = document.getElementsByTagName('nav');
    const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    let calendarConfig: CalendarOptions = {
      plugins: [ dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, adaptivePlugin ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,resourceTimeGridDay'
      },
      eventDidMount: (info) => {
        info.el.setAttribute('data-bs-toggle', 'tooltip');
        info.el.setAttribute('data-bs-placement', 'bottom');
        const time = info.event.allDay? 'Ganztägiger Termin - ' + info.event.extendedProps.room : this.getTime(info.event.start!) + '-' + this.getTime(info.event.end!) + '-' + info.event.extendedProps.room;
        info.el.title = info.event.display === 'background' ? 'Aufgrund der Ferien findet hier nichts statt.' : time;
      },
      initialView: 'dayGridMonth',
      locales: [ deLocale ],
      locale: 'de',
      initialDate: new Date(),
      weekNumbers: true,
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      themeSystem: 'bootstrap',
      height: window.innerHeight - (navEle? navEle[0].offsetHeight : 0) - 2 * oneRem,
      eventClick: (info) => {
        this.openModal(info.event);
      }    
    };
    if (this.smallScreen) {
      calendarConfig = {
        ...calendarConfig, 
        plugins: [ dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, adaptivePlugin ],
        headerToolbar: {
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth'
        },
        weekNumbers: false,
      }
    }
    this.calendar = new Calendar(this.calendarElement, calendarConfig);
    this.calendar.render();
    this.calendar.updateSize();
  }



  openModal(event: EventApi): void {
    this.selectedCalendarEvent = event;
    this.selectedEvent = this.events.find(e => e.id === event.id);

    this.detailsModal = new Modal(document.getElementById('eventDetails')!);

    const createdInput = document.getElementById('details-created-at') as HTMLInputElement;
    const startInput = document.getElementById('details-start') as HTMLInputElement;
    const endInput = document.getElementById('details-end') as HTMLInputElement;
    const descriptionInput = document.getElementById('details-description') as HTMLInputElement;
    const createdAt = this.selectedCalendarEvent.extendedProps.createdAt;
    const start = this.selectedCalendarEvent.start;
    const end = this.selectedCalendarEvent.end;
    createdInput.setAttribute('value', createdAt? new Date(createdAt.setHours(createdAt.getHours() + 2)).toISOString().slice(0, -8) : '');
    startInput.setAttribute('value', start? new Date(start.setHours(start.getHours() + 2)).toISOString().slice(0, -8) : '');
    endInput.setAttribute('value', end? new Date(end.setHours(end.getHours() + 2)).toISOString().slice(0, -8) : '');
    const desc = this.selectedCalendarEvent.extendedProps.description;
    descriptionInput.value = desc ? desc : '';
    this.detailsModal.toggle();
  }

  closeModal(): void {
    this.detailsModal?.toggle();
  }

  getTime(date: Date): string {
    if (date) {
      let hours = date.getHours().toString();
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
}
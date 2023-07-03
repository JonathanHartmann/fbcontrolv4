/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';
import { Modal, Tooltip } from 'bootstrap';
import { PageMixin } from '../../client-packages/page.mixin';
import { BASE_OPTION_REFINERS, Calendar, CalendarOptions, EventApi, EventSourceInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import deLocale from '@fullcalendar/core/locales/de';
import adaptivePlugin from '@fullcalendar/adaptive';
import listPlugin from '@fullcalendar/list';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IRoom } from '../../interfaces/room.interface';

import './calendar.scss';
import { EventService } from '../../services/event.service';
import { store } from '../../redux/store';
import { IUser } from '../../interfaces/user.interface';
import EditEvent from '../edit-event/edit-event';
import { getDate, getTime, getTimezoneTime, toDateTime } from '../../utils/utc-helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BASE_OPTION_REFINERS as any).schedulerLicenseKey = 'CC-Attribution-NonCommercial-NoDerivatives';

@customElement('web-calendar')
export default class WebCalendar extends PageMixin(LitElement) {

  @query('#calendar')
  calendarElement!: HTMLElement;
  
  calendar: Calendar | undefined = undefined;

  @property({ type: Boolean })
  loading = false;

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

  @property({ attribute: false })
  selectedDate: Date = new Date();

  constructor() {
    super();
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
              <h4>Angezeigte Räume</h4>
              ${[...this.rooms.values()].map(roomObj => {const room = roomObj.room; return html`
              <div class="form-check form-check-inline user-select-none">
                <input class="form-check-input" type="checkbox" id=${'room-' + room.id} value=${room.id} ?checked=${roomObj.checked} @input=${() => this.roomFilter(room.id)} style=${styleMap({ borderColor: room.eventColor, backgroundColor: room.eventColor})}>
                <label class="form-check-label" for=${'room-' + room.id}>${room.title}</label>
              </div>`;})}
            </div>

          <div class="calendar-section">
            ${this.loading? html`
              <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            `:html`
              <div id="calendar"></div>
            `}
          </div>

        </div>

        <edit-event id="edit-event-modal" .event=${this.selectedEvent}></edit-event>
      `
  }

  firstUpdated(): void {
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
    this.loading = true;
    if (state.events.length >= 0) {
      this.events = state.events;
    }
    if (state.rooms.length > 0) {
      state.rooms.forEach(room => {
        if (!room.hidden) {
          this.rooms.set(room.id, {room, checked: this.rooms.get(room.id) ? !!this.rooms.get(room.id)?.checked : true});
        }
      });
      this.filterEvents();
      this.setResources();
      this.requestUpdate();
    }
    this.loading = false;
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
    this.renderCalendar(filteredEvents);
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

  renderCalendar(events?: IEvent[]): void {
    const navEle = document.getElementsByTagName('nav');
    const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize)

    let formatEvents: EventSourceInput = [];
    if (events) {
      formatEvents = events.map(event => {
        // eslint-disable-next-line prefer-const
        let [startYear, startMonth, startDay] = getDate(toDateTime(event.start.seconds)).split('-').map(s => Number(s));
        const [endYear, endMonth, endDay] = getDate(toDateTime(event.end.seconds)).split('-').map(s => Number(s));
        const [startHours, startMinutes] = getTime(toDateTime(event.start.seconds)).split(':').map(s => Number(s));
        const [endHours, endMinutes] = getTime(toDateTime(event.end.seconds)).split(':').map(s => Number(s));

        const start = new Date(startYear, startMonth, startDay, startHours, startMinutes);
        const end = new Date(endYear, endMonth, endDay, endHours, endMinutes);

        const addEvent = {
          title: event.title,
          start: event.background || event.allDay? new Date(startYear, startMonth, startDay) : start,
          end: event.background || event.allDay? new Date(endYear, endMonth, endDay) : end,
          createdFrom: event.createdFrom,
          resourceId: event.roomId,
          display: event.background ? 'background' : undefined,
          description: event.description,
          room: event.room,
          color: this.rooms.get(event.roomId) ? this.rooms.get(event.roomId)!.room.eventColor : '#b1b1b1',
          createdFromId: event.createdFromId,
          id: event.id,
          seriesId: event.seriesId,
          createdAt: event.createdAt?.toDate()
        };
        if (event.allDay) {
          return{
            ...addEvent,
            allDay: event.allDay,
          };
        } else {
          return addEvent;
        }
      });
    }

    let calendarConfig: CalendarOptions = {
      locales: [deLocale],
      locale: deLocale,
      eventDidMount: (info) => {
        info.el.setAttribute('data-bs-toggle', 'tooltip');
        info.el.setAttribute('data-bs-placement', 'bottom');
        let start = '';
        let end = '';
        let time = '';
        if (info.event.allDay) {
          time = 'Ganztägiger Termin - ' + info.event.extendedProps.room
        } else if (info.event.start && info.event.end) {
          start = getTimezoneTime(info.event.start);
          end = getTimezoneTime(info.event.end);
          time = `${start}-${end}-${info.event.extendedProps.room}`
        }
        info.el.title = info.event.display === 'background' ? 'Aufgrund der Ferien findet hier nichts statt.' : time;
        if (info.event.extendedProps.description) {
          info.el.title += ' - ' + info.event.extendedProps.description;
        }
      },
      initialDate: this.selectedDate,
      weekNumbers: true,
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      dayMaxEventRows: 1,
      themeSystem: 'bootstrap',
      height: window.innerHeight - (navEle? navEle[0].offsetHeight : 0) - 2 * oneRem,
      eventClick: (info) => {
        this.openModal(info.event);
      }
    };


    if (window.innerWidth < 780) {
      calendarConfig.plugins = [ listPlugin ];
      calendarConfig.headerToolbar = 
        {
          left: 'prev,next today',
          center: 'title',
          right: 'listWeek'
        };
      calendarConfig.initialView = 'listWeek';
    } else {
      calendarConfig.plugins = [ dayGridPlugin, timeGridPlugin, resourceTimeGridPlugin, adaptivePlugin ];
      calendarConfig.headerToolbar = 
        {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,resourceTimeGridDay'
        };
      calendarConfig.initialView = 'dayGridMonth';
    }

    if (formatEvents.length > 0) {
      calendarConfig = {
        ...calendarConfig,
        events: formatEvents
      }
    }
    if (this.calendarElement && calendarConfig) {
      this.calendar = new Calendar(this.calendarElement, calendarConfig);
      this.calendar.render();
      this.calendar.updateSize();
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new Tooltip(tooltipTriggerEl);
      });
      const setSelectedDate = () => {
        this.selectedDate = this.calendar ? this.calendar.getDate() : this.selectedDate;
      }
      document.getElementsByClassName('fc-next-button')[0].addEventListener('click', setSelectedDate);
      document.getElementsByClassName('fc-prev-button')[0].addEventListener('click', setSelectedDate);
    }
  }


  openModal(event: EventApi): void {
    this.selectedCalendarEvent = event;
    this.selectedEvent = this.events.find(e => e.id === event.id);
    const modal = document.getElementById('edit-event-modal') as EditEvent;
    if (modal) {
      modal.openModal(this.selectedEvent);
    }
  }

  closeModal(): void {
    this.detailsModal?.toggle();
  }
}
import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';
import { BASE_OPTION_REFINERS, Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
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
      `
  }

  firstUpdated(): void {
    this.renderCalendar();
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
        resourceId: event.roomId
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
      eventClick: function(info) {
        alert('Event: ' + info.event.title);
      }    
    });
    this.calendar.render();
    this.calendar.updateSize();
  }
}
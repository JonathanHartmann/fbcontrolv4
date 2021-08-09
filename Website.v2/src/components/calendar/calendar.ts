import { customElement, html, LitElement, property, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import deLocale from '@fullcalendar/core/locales/de';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';
import { IRoom } from '../../interfaces/room.interface';

import './calendar.scss';

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
        this.renderSmallCalendar();
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
      <div id="calendar"></div>
      `
  }

  firstUpdated(): void {
    if (this.smallScreen) {
      this.renderSmallCalendar()
    } else {
      this.renderCalendar();
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
      this.filerEvents();
      this.requestUpdate();
    }
  }

  roomFilter(roomId: string): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const roomObj = this.rooms.get(roomId)!;
    this.rooms.set(roomId, {room: roomObj.room, checked: !roomObj.checked});
    this.filerEvents();
  }

  filerEvents(): void {
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
        createdFrom: event.createdFrom
      });
    });
  }

  renderSmallCalendar(): void {
    this.calendar = new Calendar(this.calendarElement, {
      plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      },
      locales: [ deLocale ],
      locale: 'de',
      initialDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      themeSystem: 'bootstrap',
    });
    this.calendar.render();
    this.calendar.updateSize();
  }

  renderCalendar(): void {
    this.calendar = new Calendar(this.calendarElement, {
      plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      locales: [ deLocale ],
      locale: 'de',
      initialDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      themeSystem: 'bootstrap',
    });
    this.calendar.render();
    this.calendar.updateSize();
  }
}
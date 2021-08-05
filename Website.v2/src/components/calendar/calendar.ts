import { customElement, html, LitElement, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import deLocale from '@fullcalendar/core/locales/de';

import './calendar.scss';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';

@customElement('web-calendar')
export default class WebCalendar extends PageMixin(LitElement) {

  @query('#calendar')
  calendarElement!: HTMLElement

  calendar: Calendar | undefined = undefined;

  smallScreen = false;

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
        <add-event></add-event>
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
      this.addEvents(state.events);
    }
  }

  addEvents(events: IEvent[]): void {
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
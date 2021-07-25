import { customElement, html, LitElement, query, TemplateResult } from 'lit-element';
import { PageMixin } from '../../client-packages/page.mixin';

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import './calendar.scss';
import { IEvent } from '../../interfaces/event.interface';
import { IState } from '../../interfaces/state.interface';

@customElement('web-calendar')
export default class WebCalendar extends PageMixin(LitElement) {

  @query('#calendar')
  calendarElement!: HTMLElement

  calendar: Calendar | undefined = undefined;

  render(): TemplateResult {
    return html`
        <div id="calendar"></div>
      `
  }

  firstUpdated(): void {
    this.calendar = new Calendar(this.calendarElement, {
      plugins: [ dayGridPlugin, timeGridPlugin, listPlugin ],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      editable: true,
      dayMaxEvents: true, // allow "more" link when too many events
      themeSystem: 'bootstrap',
    });
    this.calendar.render();
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
}
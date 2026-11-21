import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiCalendar } from '@/shared/ui/calendar/calendar';

@Component({
  imports: [UiCalendar],
  template: `
    <ui-calendar id="single" [(value)]="selected" />
    <ui-calendar id="multiple" mode="multiple" [(value)]="many" />
    <ui-calendar id="range" mode="range" [(value)]="range" />
  `,
})
class CalendarHost {
  selected: Date[] = [];
  many: Date[] = [];
  range: Date[] = [];
}

describe('UiCalendar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarHost] }).compileComponents();
  });

  it('renders weekday headers and one button per day of the current month', () => {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#single') as HTMLElement;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    expect(element.querySelectorAll('.ui-calendar-weekday').length).toBe(7);
    expect(element.querySelectorAll('.ui-calendar-day').length).toBe(daysInMonth);
  });

  it('selects a single day and marks it pressed', () => {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();

    const host = fixture.componentInstance as CalendarHost;
    const element = fixture.nativeElement.querySelector('#single') as HTMLElement;
    const day = element.querySelector('.ui-calendar-day') as HTMLButtonElement;

    day.click();
    fixture.detectChanges();

    expect(host.selected.length).toBe(1);
    expect(host.selected[0].getDate()).toBe(1);
    expect(day.getAttribute('aria-pressed')).toBe('true');
  });

  it('moves to the previous and next month', () => {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('#single') as HTMLElement;
    const label = () => element.querySelector('.font-display')?.textContent?.trim();
    const start = label();

    const [previous, next] = element.querySelectorAll<HTMLButtonElement>('.ui-calendar-nav');

    previous.click();
    fixture.detectChanges();
    expect(label()).not.toBe(start);

    next.click();
    fixture.detectChanges();
    expect(label()).toBe(start);
  });

  it('toggles days in multiple mode', () => {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();

    const host = fixture.componentInstance as CalendarHost;
    const element = fixture.nativeElement.querySelector('#multiple') as HTMLElement;
    const days = element.querySelectorAll<HTMLButtonElement>('.ui-calendar-day');

    days[0].click();
    fixture.detectChanges();
    expect(host.many.length).toBe(1);

    days[0].click();
    fixture.detectChanges();
    expect(host.many.length).toBe(0);
  });

  it('builds a sorted range from two clicks', () => {
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.detectChanges();

    const host = fixture.componentInstance as CalendarHost;
    const element = fixture.nativeElement.querySelector('#range') as HTMLElement;
    const days = element.querySelectorAll<HTMLButtonElement>('.ui-calendar-day');

    days[5].click();
    fixture.detectChanges();
    days[2].click();
    fixture.detectChanges();

    expect(host.range.length).toBe(2);
    expect(host.range[0].getDate()).toBe(3);
    expect(host.range[1].getDate()).toBe(6);
  });
});

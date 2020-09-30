import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeCalendarComponent } from './day-type-calendar.component';

describe('DayTypeCalendarComponent', () => {
  let component: DayTypeCalendarComponent;
  let fixture: ComponentFixture<DayTypeCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

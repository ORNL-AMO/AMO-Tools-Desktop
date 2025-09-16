import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingScheduleComponent } from './operating-schedule.component';

describe('OperatingScheduleComponent', () => {
  let component: OperatingScheduleComponent;
  let fixture: ComponentFixture<OperatingScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatingScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

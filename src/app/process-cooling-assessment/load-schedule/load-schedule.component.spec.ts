import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadScheduleComponent } from './load-schedule.component';

describe('LoadScheduleComponent', () => {
  let component: LoadScheduleComponent;
  let fixture: ComponentFixture<LoadScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatingHoursModalComponent } from './operating-hours-modal.component';

describe('OperatingHoursModalComponent', () => {
  let component: OperatingHoursModalComponent;
  let fixture: ComponentFixture<OperatingHoursModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingHoursModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingHoursModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

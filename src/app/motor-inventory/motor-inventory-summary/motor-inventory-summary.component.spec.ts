import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventorySummaryComponent } from './motor-inventory-summary.component';

describe('MotorInventorySummaryComponent', () => {
  let component: MotorInventorySummaryComponent;
  let fixture: ComponentFixture<MotorInventorySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventorySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

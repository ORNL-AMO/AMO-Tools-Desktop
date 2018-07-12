import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanMotorSummaryComponent } from './fan-motor-summary.component';

describe('FanMotorSummaryComponent', () => {
  let component: FanMotorSummaryComponent;
  let fixture: ComponentFixture<FanMotorSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanMotorSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanMotorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

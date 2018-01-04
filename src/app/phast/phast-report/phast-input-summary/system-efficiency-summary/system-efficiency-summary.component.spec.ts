import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemEfficiencySummaryComponent } from './system-efficiency-summary.component';

describe('SystemEfficiencySummaryComponent', () => {
  let component: SystemEfficiencySummaryComponent;
  let fixture: ComponentFixture<SystemEfficiencySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemEfficiencySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemEfficiencySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

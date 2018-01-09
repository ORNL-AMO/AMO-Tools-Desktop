import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputSummaryComponent } from './energy-input-summary.component';

describe('EnergyInputSummaryComponent', () => {
  let component: EnergyInputSummaryComponent;
  let fixture: ComponentFixture<EnergyInputSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

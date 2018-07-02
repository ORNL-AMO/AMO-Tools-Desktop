import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputExhaustGasSummaryComponent } from './energy-input-exhaust-gas-summary.component';

describe('EnergyInputExhaustGasSummaryComponent', () => {
  let component: EnergyInputExhaustGasSummaryComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputExhaustGasSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputExhaustGasSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

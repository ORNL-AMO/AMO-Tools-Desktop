import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputExhaustGasLossesComponent } from './energy-input-exhaust-gas-losses.component';

describe('EnergyInputExhaustGasLossesComponent', () => {
  let component: EnergyInputExhaustGasLossesComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputExhaustGasLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputExhaustGasLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

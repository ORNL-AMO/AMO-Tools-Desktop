import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputExhaustGasLossesHelpComponent } from './energy-input-exhaust-gas-losses-help.component';

describe('EnergyInputExhaustGasLossesHelpComponent', () => {
  let component: EnergyInputExhaustGasLossesHelpComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasLossesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputExhaustGasLossesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputExhaustGasLossesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

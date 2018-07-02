import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputExhaustGasTabComponent } from './energy-input-exhaust-gas-tab.component';

describe('EnergyInputExhaustGasTabComponent', () => {
  let component: EnergyInputExhaustGasTabComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputExhaustGasTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputExhaustGasTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

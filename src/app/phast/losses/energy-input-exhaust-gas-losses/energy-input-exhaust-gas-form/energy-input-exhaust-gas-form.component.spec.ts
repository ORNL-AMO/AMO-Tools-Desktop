import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputExhaustGasFormComponent } from './energy-input-exhaust-gas-form.component';

describe('EnergyInputExhaustGasFormComponent', () => {
  let component: EnergyInputExhaustGasFormComponent;
  let fixture: ComponentFixture<EnergyInputExhaustGasFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputExhaustGasFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputExhaustGasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasFormEnergyComponent } from './flue-gas-form-energy.component';

describe('FlueGasFormEnergyComponent', () => {
  let component: FlueGasFormEnergyComponent;
  let fixture: ComponentFixture<FlueGasFormEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasFormEnergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasFormEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

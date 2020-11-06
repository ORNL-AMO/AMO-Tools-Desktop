import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasFormMassComponent } from './flue-gas-form-mass.component';

describe('FlueGasFormMassComponent', () => {
  let component: FlueGasFormMassComponent;
  let fixture: ComponentFixture<FlueGasFormMassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlueGasFormMassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasFormMassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasLossesFormMassComponent } from './flue-gas-losses-form-mass.component';

describe('FlueGasLossesFormMassComponent', () => {
  let component: FlueGasLossesFormMassComponent;
  let fixture: ComponentFixture<FlueGasLossesFormMassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesFormMassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesFormMassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

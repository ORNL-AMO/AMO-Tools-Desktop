import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlueGasLossesFormComponent } from './flue-gas-losses-form.component';

describe('FlueGasLossesFormComponent', () => {
  let component: FlueGasLossesFormComponent;
  let fixture: ComponentFixture<FlueGasLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

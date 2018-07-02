import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveEquationFormComponent } from './pump-curve-equation-form.component';

describe('PumpCurveEquationFormComponent', () => {
  let component: PumpCurveEquationFormComponent;
  let fixture: ComponentFixture<PumpCurveEquationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveEquationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveEquationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

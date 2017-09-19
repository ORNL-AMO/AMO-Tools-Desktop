import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveDataFormComponent } from './pump-curve-data-form.component';

describe('PumpCurveDataFormComponent', () => {
  let component: PumpCurveDataFormComponent;
  let fixture: ComponentFixture<PumpCurveDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

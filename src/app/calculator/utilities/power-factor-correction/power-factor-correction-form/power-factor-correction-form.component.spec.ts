import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorCorrectionFormComponent } from './power-factor-correction-form.component';

describe('PowerFactorCorrectionFormComponent', () => {
  let component: PowerFactorCorrectionFormComponent;
  let fixture: ComponentFixture<PowerFactorCorrectionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerFactorCorrectionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerFactorCorrectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

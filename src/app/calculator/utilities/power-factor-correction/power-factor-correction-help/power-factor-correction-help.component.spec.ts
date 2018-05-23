import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorCorrectionHelpComponent } from './power-factor-correction-help.component';

describe('PowerFactorCorrectionHelpComponent', () => {
  let component: PowerFactorCorrectionHelpComponent;
  let fixture: ComponentFixture<PowerFactorCorrectionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerFactorCorrectionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerFactorCorrectionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

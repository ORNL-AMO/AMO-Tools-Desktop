import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorCorrectionResultsComponent } from './power-factor-correction-results.component';

describe('PowerFactorCorrectionResultsComponent', () => {
  let component: PowerFactorCorrectionResultsComponent;
  let fixture: ComponentFixture<PowerFactorCorrectionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerFactorCorrectionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerFactorCorrectionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

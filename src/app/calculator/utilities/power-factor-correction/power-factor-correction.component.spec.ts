import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerFactorCorrectionComponent } from './power-factor-correction.component';

describe('PowerFactorCorrectionComponent', () => {
  let component: PowerFactorCorrectionComponent;
  let fixture: ComponentFixture<PowerFactorCorrectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PowerFactorCorrectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerFactorCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

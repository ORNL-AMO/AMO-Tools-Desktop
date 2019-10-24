import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerBlowdownRateComponent } from './boiler-blowdown-rate.component';

describe('BoilerBlowdownRateComponent', () => {
  let component: BoilerBlowdownRateComponent;
  let fixture: ComponentFixture<BoilerBlowdownRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerBlowdownRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerBlowdownRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

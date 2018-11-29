import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateInletPressureHelpComponent } from './calculate-inlet-pressure-help.component';

describe('CalculateInletPressureHelpComponent', () => {
  let component: CalculateInletPressureHelpComponent;
  let fixture: ComponentFixture<CalculateInletPressureHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateInletPressureHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateInletPressureHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

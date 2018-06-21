import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateOutletPressureHelpComponent } from './calculate-outlet-pressure-help.component';

describe('CalculateOutletPressureHelpComponent', () => {
  let component: CalculateOutletPressureHelpComponent;
  let fixture: ComponentFixture<CalculateOutletPressureHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateOutletPressureHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateOutletPressureHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

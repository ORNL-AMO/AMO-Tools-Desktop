import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceSystemAirPressureHelpComponent } from './reduce-system-air-pressure-help.component';

describe('ReduceSystemAirPressureHelpComponent', () => {
  let component: ReduceSystemAirPressureHelpComponent;
  let fixture: ComponentFixture<ReduceSystemAirPressureHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceSystemAirPressureHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceSystemAirPressureHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

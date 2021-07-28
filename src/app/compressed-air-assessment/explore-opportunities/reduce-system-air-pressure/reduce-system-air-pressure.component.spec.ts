import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceSystemAirPressureComponent } from './reduce-system-air-pressure.component';

describe('ReduceSystemAirPressureComponent', () => {
  let component: ReduceSystemAirPressureComponent;
  let fixture: ComponentFixture<ReduceSystemAirPressureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceSystemAirPressureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceSystemAirPressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateInletPressureComponent } from './calculate-inlet-pressure.component';

describe('CalculateInletPressureComponent', () => {
  let component: CalculateInletPressureComponent;
  let fixture: ComponentFixture<CalculateInletPressureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateInletPressureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateInletPressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

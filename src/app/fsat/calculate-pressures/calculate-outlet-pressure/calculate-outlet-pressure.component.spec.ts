import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateOutletPressureComponent } from './calculate-outlet-pressure.component';

describe('CalculateOutletPressureComponent', () => {
  let component: CalculateOutletPressureComponent;
  let fixture: ComponentFixture<CalculateOutletPressureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateOutletPressureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateOutletPressureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

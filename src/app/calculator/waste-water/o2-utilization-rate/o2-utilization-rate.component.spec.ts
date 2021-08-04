import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2UtilizationRateComponent } from './o2-utilization-rate.component';

describe('O2UtilizationRateComponent', () => {
  let component: O2UtilizationRateComponent;
  let fixture: ComponentFixture<O2UtilizationRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ O2UtilizationRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(O2UtilizationRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

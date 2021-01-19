import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2UtilizationRateResultsComponent } from './o2-utilization-rate-results.component';

describe('O2UtilizationRateResultsComponent', () => {
  let component: O2UtilizationRateResultsComponent;
  let fixture: ComponentFixture<O2UtilizationRateResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ O2UtilizationRateResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(O2UtilizationRateResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

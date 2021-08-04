import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2UtilizationRateGraphComponent } from './o2-utilization-rate-graph.component';

describe('O2UtilizationRateGraphComponent', () => {
  let component: O2UtilizationRateGraphComponent;
  let fixture: ComponentFixture<O2UtilizationRateGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ O2UtilizationRateGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(O2UtilizationRateGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

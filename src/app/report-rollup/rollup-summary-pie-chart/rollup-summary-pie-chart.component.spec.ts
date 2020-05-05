import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupSummaryPieChartComponent } from './rollup-summary-pie-chart.component';

describe('RollupSummaryPieChartComponent', () => {
  let component: RollupSummaryPieChartComponent;
  let fixture: ComponentFixture<RollupSummaryPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupSummaryPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupSummaryPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

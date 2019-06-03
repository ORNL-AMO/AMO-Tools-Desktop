import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostSummaryChartComponent } from './cost-summary-chart.component';

describe('CostSummaryChartComponent', () => {
  let component: CostSummaryChartComponent;
  let fixture: ComponentFixture<CostSummaryChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostSummaryChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

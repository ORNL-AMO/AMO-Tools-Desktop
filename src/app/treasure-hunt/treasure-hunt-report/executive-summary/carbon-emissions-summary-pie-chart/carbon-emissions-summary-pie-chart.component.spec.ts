import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonEmissionsSummaryPieChartComponent } from './carbon-emissions-summary-pie-chart.component';

describe('CarbonEmissionsSummaryPieChartComponent', () => {
  let component: CarbonEmissionsSummaryPieChartComponent;
  let fixture: ComponentFixture<CarbonEmissionsSummaryPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarbonEmissionsSummaryPieChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarbonEmissionsSummaryPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

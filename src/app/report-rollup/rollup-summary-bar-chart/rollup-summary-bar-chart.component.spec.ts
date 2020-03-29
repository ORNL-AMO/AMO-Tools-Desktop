import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupSummaryBarChartComponent } from './rollup-summary-bar-chart.component';

describe('RollupSummaryBarChartComponent', () => {
  let component: RollupSummaryBarChartComponent;
  let fixture: ComponentFixture<RollupSummaryBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupSummaryBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupSummaryBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

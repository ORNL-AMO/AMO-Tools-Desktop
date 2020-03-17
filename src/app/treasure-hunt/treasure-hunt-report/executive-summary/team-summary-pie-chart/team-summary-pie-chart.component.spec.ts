import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSummaryPieChartComponent } from './team-summary-pie-chart.component';

describe('TeamSummaryPieChartComponent', () => {
  let component: TeamSummaryPieChartComponent;
  let fixture: ComponentFixture<TeamSummaryPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamSummaryPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamSummaryPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

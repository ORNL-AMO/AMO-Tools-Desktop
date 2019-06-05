import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityPaybackBarChartComponent } from './opportunity-payback-bar-chart.component';

describe('OpportunityPaybackBarChartComponent', () => {
  let component: OpportunityPaybackBarChartComponent;
  let fixture: ComponentFixture<OpportunityPaybackBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunityPaybackBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityPaybackBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

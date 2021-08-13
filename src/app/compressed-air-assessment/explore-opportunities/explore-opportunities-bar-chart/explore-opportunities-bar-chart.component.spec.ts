import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesBarChartComponent } from './explore-opportunities-bar-chart.component';

describe('ExploreOpportunitiesBarChartComponent', () => {
  let component: ExploreOpportunitiesBarChartComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

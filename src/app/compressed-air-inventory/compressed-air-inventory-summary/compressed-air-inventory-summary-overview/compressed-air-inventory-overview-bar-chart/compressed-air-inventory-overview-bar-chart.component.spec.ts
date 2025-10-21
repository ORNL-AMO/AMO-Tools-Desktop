import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryOverviewBarChartComponent } from './compressed-air-inventory-overview-bar-chart.component';

describe('CompressedAirInventoryOverviewBarChartComponent', () => {
  let component: CompressedAirInventoryOverviewBarChartComponent;
  let fixture: ComponentFixture<CompressedAirInventoryOverviewBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryOverviewBarChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryOverviewBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

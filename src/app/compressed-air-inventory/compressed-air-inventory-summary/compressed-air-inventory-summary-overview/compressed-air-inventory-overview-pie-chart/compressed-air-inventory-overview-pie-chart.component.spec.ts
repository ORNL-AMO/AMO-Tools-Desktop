import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryOverviewPieChartComponent } from './compressed-air-inventory-overview-pie-chart.component';

describe('CompressedAirInventoryOverviewPieChartComponent', () => {
  let component: CompressedAirInventoryOverviewPieChartComponent;
  let fixture: ComponentFixture<CompressedAirInventoryOverviewPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryOverviewPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryOverviewPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

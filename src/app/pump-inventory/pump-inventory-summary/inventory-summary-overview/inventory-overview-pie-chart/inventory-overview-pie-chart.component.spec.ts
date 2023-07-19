import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOverviewPieChartComponent } from './inventory-overview-pie-chart.component';

describe('InventoryOverviewPieChartComponent', () => {
  let component: InventoryOverviewPieChartComponent;
  let fixture: ComponentFixture<InventoryOverviewPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryOverviewPieChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryOverviewPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

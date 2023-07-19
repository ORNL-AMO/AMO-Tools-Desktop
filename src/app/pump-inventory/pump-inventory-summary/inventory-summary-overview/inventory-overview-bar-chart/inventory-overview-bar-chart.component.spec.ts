import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOverviewBarChartComponent } from './inventory-overview-bar-chart.component';

describe('InventoryOverviewBarChartComponent', () => {
  let component: InventoryOverviewBarChartComponent;
  let fixture: ComponentFixture<InventoryOverviewBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryOverviewBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryOverviewBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

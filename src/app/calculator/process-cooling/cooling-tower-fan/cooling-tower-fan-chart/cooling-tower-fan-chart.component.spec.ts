import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerFanChartComponent } from './cooling-tower-fan-chart.component';

describe('CoolingTowerFanChartComponent', () => {
  let component: CoolingTowerFanChartComponent;
  let fixture: ComponentFixture<CoolingTowerFanChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerFanChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerFanChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

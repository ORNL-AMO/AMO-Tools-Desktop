import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupPieChartComponent } from './rollup-pie-chart.component';

describe('RollupPieChartComponent', () => {
  let component: RollupPieChartComponent;
  let fixture: ComponentFixture<RollupPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

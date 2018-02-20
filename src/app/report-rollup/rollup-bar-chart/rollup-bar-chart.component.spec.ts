import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupBarChartComponent } from './rollup-bar-chart.component';

describe('RollupBarChartComponent', () => {
  let component: RollupBarChartComponent;
  let fixture: ComponentFixture<RollupBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupBarChartComponent } from './ssmt-rollup-bar-chart.component';

describe('SsmtRollupBarChartComponent', () => {
  let component: SsmtRollupBarChartComponent;
  let fixture: ComponentFixture<SsmtRollupBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

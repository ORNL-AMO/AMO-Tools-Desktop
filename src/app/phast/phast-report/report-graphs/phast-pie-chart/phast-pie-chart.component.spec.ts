import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastPieChartComponent } from './phast-pie-chart.component';

describe('PhastPieChartComponent', () => {
  let component: PhastPieChartComponent;
  let fixture: ComponentFixture<PhastPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

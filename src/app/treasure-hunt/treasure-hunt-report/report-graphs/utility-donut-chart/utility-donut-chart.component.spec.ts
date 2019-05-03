import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityDonutChartComponent } from './utility-donut-chart.component';

describe('UtilityDonutChartComponent', () => {
  let component: UtilityDonutChartComponent;
  let fixture: ComponentFixture<UtilityDonutChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilityDonutChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilityDonutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

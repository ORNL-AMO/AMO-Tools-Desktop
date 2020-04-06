import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityBarChartComponent } from './utility-bar-chart.component';

describe('UtilityBarChartComponent', () => {
  let component: UtilityBarChartComponent;
  let fixture: ComponentFixture<UtilityBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilityBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilityBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

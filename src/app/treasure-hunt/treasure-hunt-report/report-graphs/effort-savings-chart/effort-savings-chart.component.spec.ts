import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffortSavingsChartComponent } from './effort-savings-chart.component';

describe('EffortSavingsChartComponent', () => {
  let component: EffortSavingsChartComponent;
  let fixture: ComponentFixture<EffortSavingsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EffortSavingsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EffortSavingsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

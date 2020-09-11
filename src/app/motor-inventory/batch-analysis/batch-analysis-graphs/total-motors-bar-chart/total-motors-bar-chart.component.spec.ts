import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalMotorsBarChartComponent } from './total-motors-bar-chart.component';

describe('TotalMotorsBarChartComponent', () => {
  let component: TotalMotorsBarChartComponent;
  let fixture: ComponentFixture<TotalMotorsBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalMotorsBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalMotorsBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

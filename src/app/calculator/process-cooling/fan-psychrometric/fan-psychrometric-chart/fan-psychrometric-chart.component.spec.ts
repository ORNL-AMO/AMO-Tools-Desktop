import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanPsychrometricChartComponent } from './fan-psychrometric-chart.component';

describe('FanPsychrometricChartComponent', () => {
  let component: FanPsychrometricChartComponent;
  let fixture: ComponentFixture<FanPsychrometricChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanPsychrometricChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanPsychrometricChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtPieChartComponent } from './ssmt-pie-chart.component';

describe('SsmtPieChartComponent', () => {
  let component: SsmtPieChartComponent;
  let fixture: ComponentFixture<SsmtPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

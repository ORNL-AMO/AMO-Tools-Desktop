import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastBarChartComponent } from './phast-bar-chart.component';

describe('PhastBarChartComponent', () => {
  let component: PhastBarChartComponent;
  let fixture: ComponentFixture<PhastBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatChartComponent } from './psat-chart.component';

describe('PsatChartComponent', () => {
  let component: PsatChartComponent;
  let fixture: ComponentFixture<PsatChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

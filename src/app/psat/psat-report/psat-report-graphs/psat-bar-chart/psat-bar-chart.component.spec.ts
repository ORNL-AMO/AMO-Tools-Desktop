import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatBarChartComponent } from './psat-bar-chart.component';

describe('PsatBarChartComponent', () => {
  let component: PsatBarChartComponent;
  let fixture: ComponentFixture<PsatBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

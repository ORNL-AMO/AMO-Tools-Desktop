import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatBarChartComponent } from './fsat-bar-chart.component';

describe('FsatBarChartComponent', () => {
  let component: FsatBarChartComponent;
  let fixture: ComponentFixture<FsatBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

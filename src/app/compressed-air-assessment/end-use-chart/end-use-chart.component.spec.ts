import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUseChartComponent } from './end-use-chart.component';

describe('EndUseChartComponent', () => {
  let component: EndUseChartComponent;
  let fixture: ComponentFixture<EndUseChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUseChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemChecklistChartComponent } from './fan-system-checklist-chart.component';

describe('FanSystemChecklistChartComponent', () => {
  let component: FanSystemChecklistChartComponent;
  let fixture: ComponentFixture<FanSystemChecklistChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FanSystemChecklistChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemChecklistChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

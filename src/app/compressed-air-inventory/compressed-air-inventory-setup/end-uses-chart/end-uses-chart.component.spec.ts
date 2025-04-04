import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesChartComponent } from './end-uses-chart.component';

describe('EndUsesChartComponent', () => {
  let component: EndUsesChartComponent;
  let fixture: ComponentFixture<EndUsesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndUsesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndUsesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

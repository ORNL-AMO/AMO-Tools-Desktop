import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChillerProfileChartComponent } from './chiller-profile-chart.component';

describe('ChillerProfileChartComponent', () => {
  let component: ChillerProfileChartComponent;
  let fixture: ComponentFixture<ChillerProfileChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChillerProfileChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChillerProfileChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

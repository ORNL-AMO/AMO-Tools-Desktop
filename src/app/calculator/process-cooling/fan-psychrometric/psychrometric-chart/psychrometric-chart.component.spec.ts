import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsychrometricChartComponent } from './psychrometric-chart.component';

describe('PsychrometricChartComponent', () => {
  let component: PsychrometricChartComponent;
  let fixture: ComponentFixture<PsychrometricChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsychrometricChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PsychrometricChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

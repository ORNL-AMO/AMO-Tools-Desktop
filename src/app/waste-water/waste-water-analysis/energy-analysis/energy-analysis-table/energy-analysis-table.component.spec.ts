import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyAnalysisTableComponent } from './energy-analysis-table.component';

describe('EnergyAnalysisTableComponent', () => {
  let component: EnergyAnalysisTableComponent;
  let fixture: ComponentFixture<EnergyAnalysisTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyAnalysisTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyAnalysisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

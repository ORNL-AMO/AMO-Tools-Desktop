import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyAnalysisComponent } from './energy-analysis.component';

describe('EnergyAnalysisComponent', () => {
  let component: EnergyAnalysisComponent;
  let fixture: ComponentFixture<EnergyAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

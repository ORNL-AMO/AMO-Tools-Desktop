import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NemaEnergyEfficiencyGraphComponent } from './nema-energy-efficiency-graph.component';

describe('NemaEnergyEfficiencyGraphComponent', () => {
  let component: NemaEnergyEfficiencyGraphComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NemaEnergyEfficiencyGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

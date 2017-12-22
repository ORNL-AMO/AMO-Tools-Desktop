import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NemaEnergyEfficiencyHelpComponent } from './nema-energy-efficiency-help.component';

describe('NemaEnergyEfficiencyHelpComponent', () => {
  let component: NemaEnergyEfficiencyHelpComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NemaEnergyEfficiencyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NemaEnergyEfficiencyComponent } from './nema-energy-efficiency.component';

describe('NemaEnergyEfficiencyComponent', () => {
  let component: NemaEnergyEfficiencyComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NemaEnergyEfficiencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

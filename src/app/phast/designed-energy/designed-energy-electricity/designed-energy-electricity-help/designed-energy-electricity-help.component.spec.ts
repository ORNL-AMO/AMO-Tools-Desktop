import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyElectricityHelpComponent } from './designed-energy-electricity-help.component';

describe('DesignedEnergyElectricityHelpComponent', () => {
  let component: DesignedEnergyElectricityHelpComponent;
  let fixture: ComponentFixture<DesignedEnergyElectricityHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyElectricityHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyElectricityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

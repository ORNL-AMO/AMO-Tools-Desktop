import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyFuelHelpComponent } from './designed-energy-fuel-help.component';

describe('DesignedEnergyFuelHelpComponent', () => {
  let component: DesignedEnergyFuelHelpComponent;
  let fixture: ComponentFixture<DesignedEnergyFuelHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyFuelHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyFuelHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

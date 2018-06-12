import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyFuelFormComponent } from './designed-energy-fuel-form.component';

describe('DesignedEnergyFuelFormComponent', () => {
  let component: DesignedEnergyFuelFormComponent;
  let fixture: ComponentFixture<DesignedEnergyFuelFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyFuelFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyFuelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyElectricityFormComponent } from './designed-energy-electricity-form.component';

describe('DesignedEnergyElectricityFormComponent', () => {
  let component: DesignedEnergyElectricityFormComponent;
  let fixture: ComponentFixture<DesignedEnergyElectricityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyElectricityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyElectricityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

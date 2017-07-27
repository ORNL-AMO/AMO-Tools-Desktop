import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyElectricityComponent } from './designed-energy-electricity.component';

describe('DesignedEnergyElectricityComponent', () => {
  let component: DesignedEnergyElectricityComponent;
  let fixture: ComponentFixture<DesignedEnergyElectricityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyElectricityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyElectricityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

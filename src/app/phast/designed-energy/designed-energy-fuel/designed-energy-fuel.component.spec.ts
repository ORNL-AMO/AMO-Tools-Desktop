import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyFuelComponent } from './designed-energy-fuel.component';

describe('DesignedEnergyFuelComponent', () => {
  let component: DesignedEnergyFuelComponent;
  let fixture: ComponentFixture<DesignedEnergyFuelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyFuelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyFuelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

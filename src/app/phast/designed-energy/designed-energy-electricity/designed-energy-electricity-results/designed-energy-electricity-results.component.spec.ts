import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergyElectricityResultsComponent } from './designed-energy-electricity-results.component';

describe('DesignedEnergyElectricityResultsComponent', () => {
  let component: DesignedEnergyElectricityResultsComponent;
  let fixture: ComponentFixture<DesignedEnergyElectricityResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergyElectricityResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergyElectricityResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

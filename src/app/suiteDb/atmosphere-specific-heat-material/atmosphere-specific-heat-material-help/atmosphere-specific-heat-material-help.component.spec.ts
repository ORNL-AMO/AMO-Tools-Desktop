import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereSpecificHeatMaterialHelpComponent } from './atmosphere-specific-heat-material-help.component';

describe('AtmosphereSpecificHeatMaterialHelpComponent', () => {
  let component: AtmosphereSpecificHeatMaterialHelpComponent;
  let fixture: ComponentFixture<AtmosphereSpecificHeatMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereSpecificHeatMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereSpecificHeatMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

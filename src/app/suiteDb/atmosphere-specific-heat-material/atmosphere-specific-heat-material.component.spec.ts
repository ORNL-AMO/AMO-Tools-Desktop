import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereSpecificHeatMaterialComponent } from './atmosphere-specific-heat-material.component';

describe('AtmosphereSpecificHeatMaterialComponent', () => {
  let component: AtmosphereSpecificHeatMaterialComponent;
  let fixture: ComponentFixture<AtmosphereSpecificHeatMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereSpecificHeatMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereSpecificHeatMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

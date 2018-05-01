import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAtmosphereSpecificHeatMaterialsComponent } from './custom-atmosphere-specific-heat-materials.component';

describe('CustomAtmosphereSpecificHeatMaterialsComponent', () => {
  let component: CustomAtmosphereSpecificHeatMaterialsComponent;
  let fixture: ComponentFixture<CustomAtmosphereSpecificHeatMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAtmosphereSpecificHeatMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAtmosphereSpecificHeatMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

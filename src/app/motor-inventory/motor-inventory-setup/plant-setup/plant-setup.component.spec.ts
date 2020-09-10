import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantSetupComponent } from './plant-setup.component';

describe('PlantSetupComponent', () => {
  let component: PlantSetupComponent;
  let fixture: ComponentFixture<PlantSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

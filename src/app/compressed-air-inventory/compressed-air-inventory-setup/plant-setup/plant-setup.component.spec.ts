import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantSetupComponent } from './plant-setup.component';

describe('PlantSetupComponent', () => {
  let component: PlantSetupComponent;
  let fixture: ComponentFixture<PlantSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

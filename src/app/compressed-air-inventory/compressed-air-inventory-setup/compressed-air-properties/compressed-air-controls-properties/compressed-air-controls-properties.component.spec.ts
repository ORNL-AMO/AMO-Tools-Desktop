import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirControlsPropertiesComponent } from './compressed-air-controls-properties.component';

describe('CompressedAirControlsPropertiesComponent', () => {
  let component: CompressedAirControlsPropertiesComponent;
  let fixture: ComponentFixture<CompressedAirControlsPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirControlsPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirControlsPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

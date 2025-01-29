import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirControlsCatalogComponent } from './compressed-air-controls-catalog.component';

describe('CompressedAirControlsCatalogComponent', () => {
  let component: CompressedAirControlsCatalogComponent;
  let fixture: ComponentFixture<CompressedAirControlsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirControlsCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirControlsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

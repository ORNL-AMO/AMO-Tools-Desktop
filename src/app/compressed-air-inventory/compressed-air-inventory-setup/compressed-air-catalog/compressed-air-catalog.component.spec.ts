import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirCatalogComponent } from './compressed-air-catalog.component';

describe('CompressedAirCatalogComponent', () => {
  let component: CompressedAirCatalogComponent;
  let fixture: ComponentFixture<CompressedAirCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryBannerComponent } from './compressed-air-inventory-banner.component';

describe('CompressedAirInventoryBannerComponent', () => {
  let component: CompressedAirInventoryBannerComponent;
  let fixture: ComponentFixture<CompressedAirInventoryBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompressedAirInventoryBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

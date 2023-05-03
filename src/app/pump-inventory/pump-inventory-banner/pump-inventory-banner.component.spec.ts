import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpInventoryBannerComponent } from './pump-inventory-banner.component';

describe('PumpInventoryBannerComponent', () => {
  let component: PumpInventoryBannerComponent;
  let fixture: ComponentFixture<PumpInventoryBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpInventoryBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpInventoryBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterBannerComponent } from './waste-water-banner.component';

describe('WasteWaterBannerComponent', () => {
  let component: WasteWaterBannerComponent;
  let fixture: ComponentFixture<WasteWaterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

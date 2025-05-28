import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterBannerComponent } from './water-banner.component';

describe('WaterBannerComponent', () => {
  let component: WaterBannerComponent;
  let fixture: ComponentFixture<WaterBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

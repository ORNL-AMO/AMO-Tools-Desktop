import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirBannerComponent } from './compressed-air-banner.component';

describe('CompressedAirBannerComponent', () => {
  let component: CompressedAirBannerComponent;
  let fixture: ComponentFixture<CompressedAirBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirBannerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterDiagramBannerComponent } from './water-diagram-banner.component';

describe('WaterDiagramBannerComponent', () => {
  let component: WaterDiagramBannerComponent;
  let fixture: ComponentFixture<WaterDiagramBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterDiagramBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterDiagramBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

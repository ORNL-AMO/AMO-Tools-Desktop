import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingBannerComponent } from './process-cooling-banner.component';

describe('ProcessCoolingBannerComponent', () => {
  let component: ProcessCoolingBannerComponent;
  let fixture: ComponentFixture<ProcessCoolingBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCoolingBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessCoolingBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

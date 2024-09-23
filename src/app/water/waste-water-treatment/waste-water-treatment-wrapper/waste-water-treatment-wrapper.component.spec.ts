import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterTreatmentWrapperComponent } from './waste-water-treatment-wrapper.component';

describe('WasteWaterTreatmentWrapperComponent', () => {
  let component: WasteWaterTreatmentWrapperComponent;
  let fixture: ComponentFixture<WasteWaterTreatmentWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteWaterTreatmentWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WasteWaterTreatmentWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

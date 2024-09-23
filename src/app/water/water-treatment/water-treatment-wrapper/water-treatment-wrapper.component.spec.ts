import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterTreatmentWrapperComponent } from './water-treatment-wrapper.component';

describe('WaterTreatmentWrapperComponent', () => {
  let component: WaterTreatmentWrapperComponent;
  let fixture: ComponentFixture<WaterTreatmentWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterTreatmentWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterTreatmentWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

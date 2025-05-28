import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterTreatmentComponent } from './waste-water-treatment.component';

describe('WasteWaterTreatmentComponent', () => {
  let component: WasteWaterTreatmentComponent;
  let fixture: ComponentFixture<WasteWaterTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WasteWaterTreatmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WasteWaterTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

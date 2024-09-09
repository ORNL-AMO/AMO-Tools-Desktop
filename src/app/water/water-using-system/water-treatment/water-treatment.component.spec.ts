import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterTreatmentComponent } from './water-treatment.component';

describe('WaterTreatmentComponent', () => {
  let component: WaterTreatmentComponent;
  let fixture: ComponentFixture<WaterTreatmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterTreatmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterAssessmentComponent } from './water-assessment.component';

describe('WaterAssessmentComponent', () => {
  let component: WaterAssessmentComponent;
  let fixture: ComponentFixture<WaterAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterAssessmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

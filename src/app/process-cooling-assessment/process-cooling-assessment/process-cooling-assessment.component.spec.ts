import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingAssessmentComponent } from './process-cooling-assessment.component';

describe('ProcessCoolingAssessmentComponent', () => {
  let component: ProcessCoolingAssessmentComponent;
  let fixture: ComponentFixture<ProcessCoolingAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCoolingAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessCoolingAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

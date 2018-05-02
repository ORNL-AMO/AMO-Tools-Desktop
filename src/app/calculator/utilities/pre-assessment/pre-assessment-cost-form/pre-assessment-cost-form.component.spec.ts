import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentCostFormComponent } from './pre-assessment-cost-form.component';

describe('PreAssessmentCostFormComponent', () => {
  let component: PreAssessmentCostFormComponent;
  let fixture: ComponentFixture<PreAssessmentCostFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentCostFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentCostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

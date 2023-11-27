import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentOpportunityHelpComponent } from './assessment-opportunity-help.component';

describe('AssessmentOpportunityHelpComponent', () => {
  let component: AssessmentOpportunityHelpComponent;
  let fixture: ComponentFixture<AssessmentOpportunityHelpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentOpportunityHelpComponent]
    });
    fixture = TestBed.createComponent(AssessmentOpportunityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

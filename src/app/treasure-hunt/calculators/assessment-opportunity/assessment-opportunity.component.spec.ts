import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentOpportunityComponent } from './assessment-opportunity.component';

describe('AssessmentOpportunityComponent', () => {
  let component: AssessmentOpportunityComponent;
  let fixture: ComponentFixture<AssessmentOpportunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentOpportunityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

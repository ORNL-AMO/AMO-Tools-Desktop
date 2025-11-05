import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentProfileSummaryGraphsComponent } from './assessment-profile-summary-graphs.component';

describe('AssessmentProfileSummaryGraphsComponent', () => {
  let component: AssessmentProfileSummaryGraphsComponent;
  let fixture: ComponentFixture<AssessmentProfileSummaryGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentProfileSummaryGraphsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentProfileSummaryGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

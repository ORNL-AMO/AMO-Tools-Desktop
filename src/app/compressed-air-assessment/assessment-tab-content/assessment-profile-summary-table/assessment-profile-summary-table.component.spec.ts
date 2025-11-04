import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentProfileSummaryTableComponent } from './assessment-profile-summary-table.component';

describe('AssessmentProfileSummaryTableComponent', () => {
  let component: AssessmentProfileSummaryTableComponent;
  let fixture: ComponentFixture<AssessmentProfileSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentProfileSummaryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentProfileSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

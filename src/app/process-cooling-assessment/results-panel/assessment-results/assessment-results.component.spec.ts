import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentResultsComponent } from './assessment-results.component';

describe('AssessmentResultsComponent', () => {
  let component: AssessmentResultsComponent;
  let fixture: ComponentFixture<AssessmentResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

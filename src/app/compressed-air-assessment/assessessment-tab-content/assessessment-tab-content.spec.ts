import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessessmentTabContent } from './assessessment-tab-content';

describe('AssessessmentTabContent', () => {
  let component: AssessessmentTabContent;
  let fixture: ComponentFixture<AssessessmentTabContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessessmentTabContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessessmentTabContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

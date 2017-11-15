import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentFormComponent } from './pre-assessment-form.component';

describe('PreAssessmentFormComponent', () => {
  let component: PreAssessmentFormComponent;
  let fixture: ComponentFixture<PreAssessmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

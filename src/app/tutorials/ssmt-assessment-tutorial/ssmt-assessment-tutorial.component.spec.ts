import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtAssessmentTutorialComponent } from './ssmt-assessment-tutorial.component';

describe('SsmtAssessmentTutorialComponent', () => {
  let component: SsmtAssessmentTutorialComponent;
  let fixture: ComponentFixture<SsmtAssessmentTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtAssessmentTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtAssessmentTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

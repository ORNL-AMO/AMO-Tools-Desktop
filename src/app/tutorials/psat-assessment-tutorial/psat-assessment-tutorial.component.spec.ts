import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatAssessmentTutorialComponent } from './psat-assessment-tutorial.component';

describe('PsatAssessmentTutorialComponent', () => {
  let component: PsatAssessmentTutorialComponent;
  let fixture: ComponentFixture<PsatAssessmentTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatAssessmentTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatAssessmentTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

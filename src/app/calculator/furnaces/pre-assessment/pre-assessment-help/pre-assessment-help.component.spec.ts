import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentHelpComponent } from './pre-assessment-help.component';

describe('PreAssessmentHelpComponent', () => {
  let component: PreAssessmentHelpComponent;
  let fixture: ComponentFixture<PreAssessmentHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

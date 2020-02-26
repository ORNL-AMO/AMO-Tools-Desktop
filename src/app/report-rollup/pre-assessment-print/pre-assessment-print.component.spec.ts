import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentPrintComponent } from './pre-assessment-print.component';

describe('PreAssessmentPrintComponent', () => {
  let component: PreAssessmentPrintComponent;
  let fixture: ComponentFixture<PreAssessmentPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

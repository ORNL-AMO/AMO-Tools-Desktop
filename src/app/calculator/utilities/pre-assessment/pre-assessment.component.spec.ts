import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentComponent } from './pre-assessment.component';

describe('PreAssessmentComponent', () => {
  let component: PreAssessmentComponent;
  let fixture: ComponentFixture<PreAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentMeteredComponent } from './pre-assessment-metered.component';

describe('PreAssessmentMeteredComponent', () => {
  let component: PreAssessmentMeteredComponent;
  let fixture: ComponentFixture<PreAssessmentMeteredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentMeteredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentMeteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

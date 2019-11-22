import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentCardComponent } from './pre-assessment-card.component';

describe('PreAssessmentCardComponent', () => {
  let component: PreAssessmentCardComponent;
  let fixture: ComponentFixture<PreAssessmentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

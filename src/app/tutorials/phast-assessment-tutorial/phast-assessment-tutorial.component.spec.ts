import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastAssessmentTutorialComponent } from './phast-assessment-tutorial.component';

describe('PhastAssessmentTutorialComponent', () => {
  let component: PhastAssessmentTutorialComponent;
  let fixture: ComponentFixture<PhastAssessmentTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastAssessmentTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastAssessmentTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

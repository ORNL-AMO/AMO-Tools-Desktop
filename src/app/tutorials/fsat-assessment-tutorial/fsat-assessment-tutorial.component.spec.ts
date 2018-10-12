import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatAssessmentTutorialComponent } from './fsat-assessment-tutorial.component';

describe('FsatAssessmentTutorialComponent', () => {
  let component: FsatAssessmentTutorialComponent;
  let fixture: ComponentFixture<FsatAssessmentTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatAssessmentTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatAssessmentTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentGraphComponent } from './pre-assessment-graph.component';

describe('PreAssessmentGraphComponent', () => {
  let component: PreAssessmentGraphComponent;
  let fixture: ComponentFixture<PreAssessmentGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

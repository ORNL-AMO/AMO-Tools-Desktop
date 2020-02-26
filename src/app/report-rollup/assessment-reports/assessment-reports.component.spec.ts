import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentReportsComponent } from './assessment-reports.component';

describe('AssessmentReportsComponent', () => {
  let component: AssessmentReportsComponent;
  let fixture: ComponentFixture<AssessmentReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

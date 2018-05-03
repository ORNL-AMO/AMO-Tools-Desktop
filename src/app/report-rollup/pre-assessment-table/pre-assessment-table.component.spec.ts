import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentTableComponent } from './pre-assessment-table.component';

describe('PreAssessmentTableComponent', () => {
  let component: PreAssessmentTableComponent;
  let fixture: ComponentFixture<PreAssessmentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

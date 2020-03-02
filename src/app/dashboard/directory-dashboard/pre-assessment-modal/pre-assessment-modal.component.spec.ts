import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentModalComponent } from './pre-assessment-modal.component';

describe('PreAssessmentModalComponent', () => {
  let component: PreAssessmentModalComponent;
  let fixture: ComponentFixture<PreAssessmentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

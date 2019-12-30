import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentItemComponent } from './pre-assessment-item.component';

describe('PreAssessmentItemComponent', () => {
  let component: PreAssessmentItemComponent;
  let fixture: ComponentFixture<PreAssessmentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

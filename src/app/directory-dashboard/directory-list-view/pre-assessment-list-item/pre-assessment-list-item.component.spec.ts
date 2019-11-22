import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentListItemComponent } from './pre-assessment-list-item.component';

describe('PreAssessmentListItemComponent', () => {
  let component: PreAssessmentListItemComponent;
  let fixture: ComponentFixture<PreAssessmentListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPreAssessmentListItemComponent } from './add-pre-assessment-list-item.component';

describe('AddPreAssessmentListItemComponent', () => {
  let component: AddPreAssessmentListItemComponent;
  let fixture: ComponentFixture<AddPreAssessmentListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPreAssessmentListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPreAssessmentListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

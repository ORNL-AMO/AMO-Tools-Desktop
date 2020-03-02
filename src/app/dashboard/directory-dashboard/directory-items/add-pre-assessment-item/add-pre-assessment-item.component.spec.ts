import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPreAssessmentItemComponent } from './add-pre-assessment-item.component';

describe('AddPreAssessmentItemComponent', () => {
  let component: AddPreAssessmentItemComponent;
  let fixture: ComponentFixture<AddPreAssessmentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPreAssessmentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPreAssessmentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

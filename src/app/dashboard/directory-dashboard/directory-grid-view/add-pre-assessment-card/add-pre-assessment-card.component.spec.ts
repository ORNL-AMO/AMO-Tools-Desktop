import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPreAssessmentCardComponent } from './add-pre-assessment-card.component';

describe('AddPreAssessmentCardComponent', () => {
  let component: AddPreAssessmentCardComponent;
  let fixture: ComponentFixture<AddPreAssessmentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPreAssessmentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPreAssessmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

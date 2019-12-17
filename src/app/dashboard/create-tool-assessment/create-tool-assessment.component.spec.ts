import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateToolAssessmentComponent } from './create-tool-assessment.component';

describe('CreateToolAssessmentComponent', () => {
  let component: CreateToolAssessmentComponent;
  let fixture: ComponentFixture<CreateToolAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateToolAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateToolAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

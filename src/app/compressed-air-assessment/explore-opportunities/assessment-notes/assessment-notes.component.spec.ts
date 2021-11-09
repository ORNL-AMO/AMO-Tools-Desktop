import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentNotesComponent } from './assessment-notes.component';

describe('AssessmentNotesComponent', () => {
  let component: AssessmentNotesComponent;
  let fixture: ComponentFixture<AssessmentNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

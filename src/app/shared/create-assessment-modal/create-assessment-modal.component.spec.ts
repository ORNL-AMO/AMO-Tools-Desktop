import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAssessmentModalComponent } from './create-assessment-modal.component';

describe('CreateAssessmentModalComponent', () => {
  let component: CreateAssessmentModalComponent;
  let fixture: ComponentFixture<CreateAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAssessmentModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

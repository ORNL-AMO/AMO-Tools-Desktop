import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAssessmentModalComponent } from './select-assessment-modal.component';

describe('SelectAssessmentModalComponent', () => {
  let component: SelectAssessmentModalComponent;
  let fixture: ComponentFixture<SelectAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectAssessmentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentComponent } from './assessment.component';

describe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

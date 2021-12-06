import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentCo2SavingsComponent } from './assessment-co2-savings.component';

describe('AssessmentCo2SavingsComponent', () => {
  let component: AssessmentCo2SavingsComponent;
  let fixture: ComponentFixture<AssessmentCo2SavingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentCo2SavingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentCo2SavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

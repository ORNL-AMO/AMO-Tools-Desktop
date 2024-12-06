import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceSurveyComponent } from './experience-survey.component';

describe('ExperienceSurveyComponent', () => {
  let component: ExperienceSurveyComponent;
  let fixture: ComponentFixture<ExperienceSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceSurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

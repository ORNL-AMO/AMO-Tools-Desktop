import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyToastComponent } from './survey-toast.component';

describe('SurveyToastComponent', () => {
  let component: SurveyToastComponent;
  let fixture: ComponentFixture<SurveyToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyToastComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SurveyToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

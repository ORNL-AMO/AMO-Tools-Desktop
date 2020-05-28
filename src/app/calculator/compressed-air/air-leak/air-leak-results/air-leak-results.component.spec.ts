import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirLeakSurveyResultsComponent } from './air-leak-results.component';

describe('AirLeakSurveyResultsComponent', () => {
  let component: AirLeakSurveyResultsComponent;
  let fixture: ComponentFixture<AirLeakSurveyResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirLeakSurveyResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirLeakSurveyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

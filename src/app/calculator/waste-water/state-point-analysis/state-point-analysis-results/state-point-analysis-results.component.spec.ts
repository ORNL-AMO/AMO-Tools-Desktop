import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatePointAnalysisResultsComponent } from './state-point-analysis-results.component';

describe('StatePointAnalysisResultsComponent', () => {
  let component: StatePointAnalysisResultsComponent;
  let fixture: ComponentFixture<StatePointAnalysisResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatePointAnalysisResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatePointAnalysisResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

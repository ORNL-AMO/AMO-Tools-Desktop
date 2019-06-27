import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanAnalysisResultsComponent } from './fan-analysis-results.component';

describe('FanAnalysisResultsComponent', () => {
  let component: FanAnalysisResultsComponent;
  let fixture: ComponentFixture<FanAnalysisResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanAnalysisResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanAnalysisResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

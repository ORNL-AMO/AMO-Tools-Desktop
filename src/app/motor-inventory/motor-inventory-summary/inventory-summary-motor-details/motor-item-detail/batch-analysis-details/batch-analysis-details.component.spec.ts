import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisDetailsComponent } from './batch-analysis-details.component';

describe('BatchAnalysisDetailsComponent', () => {
  let component: BatchAnalysisDetailsComponent;
  let fixture: ComponentFixture<BatchAnalysisDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

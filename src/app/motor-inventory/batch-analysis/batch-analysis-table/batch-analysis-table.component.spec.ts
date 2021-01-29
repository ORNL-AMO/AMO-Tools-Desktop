import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisTableComponent } from './batch-analysis-table.component';

describe('BatchAnalysisTableComponent', () => {
  let component: BatchAnalysisTableComponent;
  let fixture: ComponentFixture<BatchAnalysisTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

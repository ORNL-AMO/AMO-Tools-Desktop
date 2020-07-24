import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisDataComponent } from './batch-analysis-data.component';

describe('BatchAnalysisDataComponent', () => {
  let component: BatchAnalysisDataComponent;
  let fixture: ComponentFixture<BatchAnalysisDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

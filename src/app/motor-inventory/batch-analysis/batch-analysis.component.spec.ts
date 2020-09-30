import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisComponent } from './batch-analysis.component';

describe('BatchAnalysisComponent', () => {
  let component: BatchAnalysisComponent;
  let fixture: ComponentFixture<BatchAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

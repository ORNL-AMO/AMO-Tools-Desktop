import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisHelpComponent } from './batch-analysis-help.component';

describe('BatchAnalysisHelpComponent', () => {
  let component: BatchAnalysisHelpComponent;
  let fixture: ComponentFixture<BatchAnalysisHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

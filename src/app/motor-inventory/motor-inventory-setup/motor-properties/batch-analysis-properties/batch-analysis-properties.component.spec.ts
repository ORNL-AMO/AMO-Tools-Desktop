import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisPropertiesComponent } from './batch-analysis-properties.component';

describe('BatchAnalysisPropertiesComponent', () => {
  let component: BatchAnalysisPropertiesComponent;
  let fixture: ComponentFixture<BatchAnalysisPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

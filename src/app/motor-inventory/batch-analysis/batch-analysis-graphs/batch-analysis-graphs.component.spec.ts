import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisGraphsComponent } from './batch-analysis-graphs.component';

describe('BatchAnalysisGraphsComponent', () => {
  let component: BatchAnalysisGraphsComponent;
  let fixture: ComponentFixture<BatchAnalysisGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

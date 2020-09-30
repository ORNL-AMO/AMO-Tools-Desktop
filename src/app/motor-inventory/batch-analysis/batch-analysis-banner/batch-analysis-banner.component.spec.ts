import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAnalysisBannerComponent } from './batch-analysis-banner.component';

describe('BatchAnalysisBannerComponent', () => {
  let component: BatchAnalysisBannerComponent;
  let fixture: ComponentFixture<BatchAnalysisBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAnalysisBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAnalysisBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

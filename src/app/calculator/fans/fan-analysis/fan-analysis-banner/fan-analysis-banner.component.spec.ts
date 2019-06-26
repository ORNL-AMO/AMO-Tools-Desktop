import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanAnalysisBannerComponent } from './fan-analysis-banner.component';

describe('FanAnalysisBannerComponent', () => {
  let component: FanAnalysisBannerComponent;
  let fixture: ComponentFixture<FanAnalysisBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanAnalysisBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanAnalysisBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

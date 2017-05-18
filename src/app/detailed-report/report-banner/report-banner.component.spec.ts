import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBannerComponent } from './report-banner.component';

describe('ReportBannerComponent', () => {
  let component: ReportBannerComponent;
  let fixture: ComponentFixture<ReportBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

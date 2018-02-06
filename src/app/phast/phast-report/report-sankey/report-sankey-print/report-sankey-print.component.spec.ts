import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSankeyPrintComponent } from './report-sankey-print.component';

describe('ReportSankeyPrintComponent', () => {
  let component: ReportSankeyPrintComponent;
  let fixture: ComponentFixture<ReportSankeyPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSankeyPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSankeyPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

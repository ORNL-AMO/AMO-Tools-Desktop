import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRollupPrintComponent } from './report-rollup-print.component';

describe('ReportRollupPrintComponent', () => {
  let component: ReportRollupPrintComponent;
  let fixture: ComponentFixture<ReportRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatReportSankeyComponent } from './psat-report-sankey.component';

describe('PsatReportSankeyComponent', () => {
  let component: PsatReportSankeyComponent;
  let fixture: ComponentFixture<PsatReportSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatReportSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

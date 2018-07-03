import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatReportSankeyComponent } from './fsat-report-sankey.component';

describe('FsatReportSankeyComponent', () => {
  let component: FsatReportSankeyComponent;
  let fixture: ComponentFixture<FsatReportSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatReportSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

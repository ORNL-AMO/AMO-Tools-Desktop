import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatReportComponent } from './fsat-report.component';

describe('FsatReportComponent', () => {
  let component: FsatReportComponent;
  let fixture: ComponentFixture<FsatReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

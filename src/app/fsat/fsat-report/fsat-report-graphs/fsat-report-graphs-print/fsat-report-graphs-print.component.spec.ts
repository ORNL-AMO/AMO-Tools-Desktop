import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatReportGraphsPrintComponent } from './fsat-report-graphs-print.component';

describe('FsatReportGraphsPrintComponent', () => {
  let component: FsatReportGraphsPrintComponent;
  let fixture: ComponentFixture<FsatReportGraphsPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatReportGraphsPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatReportGraphsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatReportGraphsPrintComponent } from './psat-report-graphs-print.component';

describe('PsatReportGraphsPrintComponent', () => {
  let component: PsatReportGraphsPrintComponent;
  let fixture: ComponentFixture<PsatReportGraphsPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatReportGraphsPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatReportGraphsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatReportGraphsComponent } from './psat-report-graphs.component';

describe('PsatReportGraphsComponent', () => {
  let component: PsatReportGraphsComponent;
  let fixture: ComponentFixture<PsatReportGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatReportGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatReportGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

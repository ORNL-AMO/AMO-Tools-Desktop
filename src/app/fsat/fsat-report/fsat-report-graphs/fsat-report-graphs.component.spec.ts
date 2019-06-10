import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatReportGraphsComponent } from './fsat-report-graphs.component';

describe('FsatReportGraphsComponent', () => {
  let component: FsatReportGraphsComponent;
  let fixture: ComponentFixture<FsatReportGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatReportGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatReportGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGraphsPrintComponent } from './report-graphs-print.component';

describe('ReportGraphsPrintComponent', () => {
  let component: ReportGraphsPrintComponent;
  let fixture: ComponentFixture<ReportGraphsPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportGraphsPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportGraphsPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

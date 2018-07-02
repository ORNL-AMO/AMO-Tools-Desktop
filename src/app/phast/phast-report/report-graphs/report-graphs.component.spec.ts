import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportGraphsComponent } from './report-graphs.component';

describe('ReportGraphsComponent', () => {
  let component: ReportGraphsComponent;
  let fixture: ComponentFixture<ReportGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

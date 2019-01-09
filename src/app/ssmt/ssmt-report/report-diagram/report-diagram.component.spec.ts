import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDiagramComponent } from './report-diagram.component';

describe('ReportDiagramComponent', () => {
  let component: ReportDiagramComponent;
  let fixture: ComponentFixture<ReportDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

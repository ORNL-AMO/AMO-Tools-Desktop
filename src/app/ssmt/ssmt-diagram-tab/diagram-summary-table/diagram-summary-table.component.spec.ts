import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramSummaryTableComponent } from './diagram-summary-table.component';

describe('DiagramSummaryTableComponent', () => {
  let component: DiagramSummaryTableComponent;
  let fixture: ComponentFixture<DiagramSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagramSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagramSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

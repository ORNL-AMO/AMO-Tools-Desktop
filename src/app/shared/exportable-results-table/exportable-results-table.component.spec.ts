import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportableResultsTableComponent } from './exportable-results-table.component';

describe('ExportableResultsTableComponent', () => {
  let component: ExportableResultsTableComponent;
  let fixture: ComponentFixture<ExportableResultsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportableResultsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportableResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

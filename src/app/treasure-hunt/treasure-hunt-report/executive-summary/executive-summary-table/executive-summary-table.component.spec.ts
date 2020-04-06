import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveSummaryTableComponent } from './executive-summary-table.component';

describe('ExecutiveSummaryTableComponent', () => {
  let component: ExecutiveSummaryTableComponent;
  let fixture: ComponentFixture<ExecutiveSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualDaySummaryTableComponent } from './individual-day-summary-table.component';

describe('IndividualDaySummaryTableComponent', () => {
  let component: IndividualDaySummaryTableComponent;
  let fixture: ComponentFixture<IndividualDaySummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualDaySummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualDaySummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

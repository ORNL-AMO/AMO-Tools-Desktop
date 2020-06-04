import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayTypeSummaryTableComponent } from './day-type-summary-table.component';

describe('DayTypeSummaryTableComponent', () => {
  let component: DayTypeSummaryTableComponent;
  let fixture: ComponentFixture<DayTypeSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayTypeSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayTypeSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

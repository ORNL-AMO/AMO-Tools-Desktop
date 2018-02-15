import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupFurnaceSummaryTableComponent } from './phast-rollup-furnace-summary-table.component';

describe('PhastRollupFurnaceSummaryTableComponent', () => {
  let component: PhastRollupFurnaceSummaryTableComponent;
  let fixture: ComponentFixture<PhastRollupFurnaceSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupFurnaceSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupFurnaceSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

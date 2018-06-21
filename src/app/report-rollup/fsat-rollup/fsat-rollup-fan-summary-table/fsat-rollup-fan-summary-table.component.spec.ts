import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupFanSummaryTableComponent } from './fsat-rollup-fan-summary-table.component';

describe('FsatRollupFanSummaryTableComponent', () => {
  let component: FsatRollupFanSummaryTableComponent;
  let fixture: ComponentFixture<FsatRollupFanSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupFanSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupFanSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

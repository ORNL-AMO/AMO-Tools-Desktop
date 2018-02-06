import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupPumpSummaryTableComponent } from './psat-rollup-pump-summary-table.component';

describe('PsatRollupPumpSummaryTableComponent', () => {
  let component: PsatRollupPumpSummaryTableComponent;
  let fixture: ComponentFixture<PsatRollupPumpSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupPumpSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupPumpSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

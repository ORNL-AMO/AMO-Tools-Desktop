import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupSummaryTableComponent } from './ssmt-rollup-summary-table.component';

describe('SsmtRollupSummaryTableComponent', () => {
  let component: SsmtRollupSummaryTableComponent;
  let fixture: ComponentFixture<SsmtRollupSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupSteamSummaryTableComponent } from './ssmt-rollup-steam-summary-table.component';

describe('SsmtRollupSteamSummaryTableComponent', () => {
  let component: SsmtRollupSteamSummaryTableComponent;
  let fixture: ComponentFixture<SsmtRollupSteamSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupSteamSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupSteamSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

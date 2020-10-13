import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupSummaryTableComponent } from './rollup-summary-table.component';

describe('RollupSummaryTableComponent', () => {
  let component: RollupSummaryTableComponent;
  let fixture: ComponentFixture<RollupSummaryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupSummaryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

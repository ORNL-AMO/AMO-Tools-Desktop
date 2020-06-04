import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollupSummaryEnergyTableComponent } from './rollup-summary-energy-table.component';

describe('RollupSummaryEnergyTableComponent', () => {
  let component: RollupSummaryEnergyTableComponent;
  let fixture: ComponentFixture<RollupSummaryEnergyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollupSummaryEnergyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollupSummaryEnergyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

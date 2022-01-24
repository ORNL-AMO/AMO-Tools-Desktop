import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarbonEmissionsSummaryTableComponent } from './carbon-emissions-summary-table.component';

describe('CarbonEmissionsSummaryTableComponent', () => {
  let component: CarbonEmissionsSummaryTableComponent;
  let fixture: ComponentFixture<CarbonEmissionsSummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarbonEmissionsSummaryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarbonEmissionsSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

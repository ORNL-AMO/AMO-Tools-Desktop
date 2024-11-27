import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterBalanceResultsTableComponent } from './water-balance-results-table.component';

describe('WaterBalanceResultsTableComponent', () => {
  let component: WaterBalanceResultsTableComponent;
  let fixture: ComponentFixture<WaterBalanceResultsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterBalanceResultsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterBalanceResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryTableComponent } from './compressed-air-inventory-summary-table.component';

describe('CompressedAirInventorySummaryTableComponent', () => {
  let component: CompressedAirInventorySummaryTableComponent;
  let fixture: ComponentFixture<CompressedAirInventorySummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventorySummaryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventorySummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

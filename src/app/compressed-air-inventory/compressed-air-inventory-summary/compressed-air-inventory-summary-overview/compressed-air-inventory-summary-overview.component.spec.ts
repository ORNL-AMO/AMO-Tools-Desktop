import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryOverviewComponent } from './compressed-air-inventory-summary-overview.component';

describe('CompressedAirInventorySummaryOverviewComponent', () => {
  let component: CompressedAirInventorySummaryOverviewComponent;
  let fixture: ComponentFixture<CompressedAirInventorySummaryOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventorySummaryOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventorySummaryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

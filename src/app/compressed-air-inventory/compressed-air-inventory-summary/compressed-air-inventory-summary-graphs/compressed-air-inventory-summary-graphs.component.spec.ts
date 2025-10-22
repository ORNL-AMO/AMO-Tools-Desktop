import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryGraphsComponent } from './compressed-air-inventory-summary-graphs.component';

describe('CompressedAirInventorySummaryGraphsComponent', () => {
  let component: CompressedAirInventorySummaryGraphsComponent;
  let fixture: ComponentFixture<CompressedAirInventorySummaryGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventorySummaryGraphsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventorySummaryGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

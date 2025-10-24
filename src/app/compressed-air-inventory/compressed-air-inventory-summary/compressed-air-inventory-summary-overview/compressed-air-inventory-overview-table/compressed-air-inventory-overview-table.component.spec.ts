import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryOverviewTableComponent } from './compressed-air-inventory-overview-table.component';

describe('CompressedAirInventoryOverviewTableComponent', () => {
  let component: CompressedAirInventoryOverviewTableComponent;
  let fixture: ComponentFixture<CompressedAirInventoryOverviewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryOverviewTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryOverviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

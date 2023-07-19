import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryTableComponent } from './inventory-summary-table.component';

describe('InventorySummaryTableComponent', () => {
  let component: InventorySummaryTableComponent;
  let fixture: ComponentFixture<InventorySummaryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySummaryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

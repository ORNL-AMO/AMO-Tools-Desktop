import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOverviewTableComponent } from './inventory-overview-table.component';

describe('InventoryOverviewTableComponent', () => {
  let component: InventoryOverviewTableComponent;
  let fixture: ComponentFixture<InventoryOverviewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryOverviewTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryOverviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

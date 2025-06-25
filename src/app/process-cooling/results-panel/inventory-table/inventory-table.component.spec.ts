import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTableComponent } from './inventory-table.component';

describe('InventoryTableComponent', () => {
  let component: InventoryTableComponent;
  let fixture: ComponentFixture<InventoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryOverviewTableComponent } from './inventory-overview-table.component';

describe('InventoryOverviewTableComponent', () => {
  let component: InventoryOverviewTableComponent;
  let fixture: ComponentFixture<InventoryOverviewTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryOverviewTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryOverviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

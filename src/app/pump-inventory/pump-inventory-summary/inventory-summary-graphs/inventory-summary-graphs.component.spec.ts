import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryGraphsComponent } from './inventory-summary-graphs.component';

describe('InventorySummaryGraphsComponent', () => {
  let component: InventorySummaryGraphsComponent;
  let fixture: ComponentFixture<InventorySummaryGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySummaryGraphsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

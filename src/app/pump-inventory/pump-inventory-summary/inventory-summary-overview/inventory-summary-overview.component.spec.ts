import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryOverviewComponent } from './inventory-summary-overview.component';

describe('InventorySummaryOverviewComponent', () => {
  let component: InventorySummaryOverviewComponent;
  let fixture: ComponentFixture<InventorySummaryOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySummaryOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

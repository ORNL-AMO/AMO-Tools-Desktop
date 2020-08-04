import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryGraphsTabsComponent } from './inventory-summary-graphs-tabs.component';

describe('InventorySummaryGraphsTabsComponent', () => {
  let component: InventorySummaryGraphsTabsComponent;
  let fixture: ComponentFixture<InventorySummaryGraphsTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorySummaryGraphsTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryGraphsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

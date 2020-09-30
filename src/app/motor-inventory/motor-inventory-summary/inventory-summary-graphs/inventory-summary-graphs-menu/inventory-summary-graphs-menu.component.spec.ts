import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryGraphsMenuComponent } from './inventory-summary-graphs-menu.component';

describe('InventorySummaryGraphsMenuComponent', () => {
  let component: InventorySummaryGraphsMenuComponent;
  let fixture: ComponentFixture<InventorySummaryGraphsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorySummaryGraphsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryGraphsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

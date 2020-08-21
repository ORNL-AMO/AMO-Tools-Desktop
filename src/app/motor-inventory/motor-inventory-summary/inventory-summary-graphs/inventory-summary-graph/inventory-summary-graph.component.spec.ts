import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryGraphComponent } from './inventory-summary-graph.component';

describe('InventorySummaryGraphComponent', () => {
  let component: InventorySummaryGraphComponent;
  let fixture: ComponentFixture<InventorySummaryGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorySummaryGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

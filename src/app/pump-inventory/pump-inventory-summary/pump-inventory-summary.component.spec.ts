import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpInventorySummaryComponent } from './pump-inventory-summary.component';

describe('PumpInventorySummaryComponent', () => {
  let component: PumpInventorySummaryComponent;
  let fixture: ComponentFixture<PumpInventorySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpInventorySummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpInventorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

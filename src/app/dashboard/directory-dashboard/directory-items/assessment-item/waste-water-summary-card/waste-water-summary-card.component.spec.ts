import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteWaterSummaryCardComponent } from './waste-water-summary-card.component';

describe('WasteWaterSummaryCardComponent', () => {
  let component: WasteWaterSummaryCardComponent;
  let fixture: ComponentFixture<WasteWaterSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteWaterSummaryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteWaterSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

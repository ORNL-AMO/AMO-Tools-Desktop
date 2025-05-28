import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterSummaryCardComponent } from './water-summary-card.component';

describe('WaterSummaryCardComponent', () => {
  let component: WaterSummaryCardComponent;
  let fixture: ComponentFixture<WaterSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterSummaryCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

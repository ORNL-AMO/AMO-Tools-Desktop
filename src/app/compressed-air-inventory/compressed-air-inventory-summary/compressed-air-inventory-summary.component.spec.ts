import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventorySummaryComponent } from './compressed-air-inventory-summary.component';

describe('CompressedAirInventorySummaryComponent', () => {
  let component: CompressedAirInventorySummaryComponent;
  let fixture: ComponentFixture<CompressedAirInventorySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventorySummaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompressedAirInventorySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

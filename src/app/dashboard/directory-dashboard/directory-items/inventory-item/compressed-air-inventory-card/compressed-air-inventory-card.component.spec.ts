import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryCardComponent } from './compressed-air-inventory-card.component';

describe('CompressedAirInventoryCardComponent', () => {
  let component: CompressedAirInventoryCardComponent;
  let fixture: ComponentFixture<CompressedAirInventoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirInventoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

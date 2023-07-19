import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpInventoryCardComponent } from './pump-inventory-card.component';

describe('PumpInventoryCardComponent', () => {
  let component: PumpInventoryCardComponent;
  let fixture: ComponentFixture<PumpInventoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpInventoryCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpInventoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpInventoryComponent } from './pump-inventory.component';

describe('PumpInventoryComponent', () => {
  let component: PumpInventoryComponent;
  let fixture: ComponentFixture<PumpInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpInventorySetupComponent } from './pump-inventory-setup.component';

describe('PumpInventorySetupComponent', () => {
  let component: PumpInventorySetupComponent;
  let fixture: ComponentFixture<PumpInventorySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpInventorySetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpInventorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

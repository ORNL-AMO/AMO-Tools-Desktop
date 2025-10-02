import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySetupComponent } from './inventory-setup.component';

describe('InventorySetupComponent', () => {
  let component: InventorySetupComponent;
  let fixture: ComponentFixture<InventorySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

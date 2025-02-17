import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCapacityInventoryModalComponent } from './system-capacity-inventory-modal.component';

describe('SystemCapacityInventoryModalComponent', () => {
  let component: SystemCapacityInventoryModalComponent;
  let fixture: ComponentFixture<SystemCapacityInventoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemCapacityInventoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemCapacityInventoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

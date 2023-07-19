import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegratePumpInventoryComponent } from './integrate-pump-inventory.component';

describe('IntegratePumpInventoryComponent', () => {
  let component: IntegratePumpInventoryComponent;
  let fixture: ComponentFixture<IntegratePumpInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegratePumpInventoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegratePumpInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

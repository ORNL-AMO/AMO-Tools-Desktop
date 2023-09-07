import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryIntegrationComponent } from './inventory-integration.component';

describe('InventoryIntegrationComponent', () => {
  let component: InventoryIntegrationComponent;
  let fixture: ComponentFixture<InventoryIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

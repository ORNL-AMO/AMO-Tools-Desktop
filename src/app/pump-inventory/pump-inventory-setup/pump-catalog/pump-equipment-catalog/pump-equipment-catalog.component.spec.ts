import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpEquipmentCatalogComponent } from './pump-equipment-catalog.component';

describe('PumpEquipmentCatalogComponent', () => {
  let component: PumpEquipmentCatalogComponent;
  let fixture: ComponentFixture<PumpEquipmentCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpEquipmentCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpEquipmentCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
